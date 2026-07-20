import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

interface CartLine {
  imageId: string;
  quantity: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!keyId || !keySecret) {
      res.status(500).json({ error: 'Razorpay is not configured' });
      return;
    }
    if (!supabaseUrl || !supabaseAnonKey) {
      res.status(500).json({ error: 'Supabase is not configured for this function' });
      return;
    }

    const items: CartLine[] = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const imageIds = items.map(i => i.imageId);
    const { data: images, error } = await supabase
      .from('project_images')
      .select('id, razorpay_amount')
      .in('id', imageIds);

    if (error) {
      console.error('Supabase lookup failed:', error);
      res.status(500).json({ error: 'Failed to look up item prices' });
      return;
    }

    const priceById = new Map((images ?? []).map(img => [img.id, img.razorpay_amount as number | null]));

    let totalRupees = 0;
    for (const line of items) {
      const price = priceById.get(line.imageId);
      if (!price || price <= 0) {
        res.status(400).json({ error: `Item ${line.imageId} is not purchasable` });
        return;
      }
      const quantity = Number.isInteger(line.quantity) && line.quantity > 0 ? line.quantity : 1;
      totalRupees += price * quantity;
    }

    const amountPaise = Math.round(totalRupees * 100);

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `cart_${Date.now()}`,
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error('create-razorpay-order failed:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
}
