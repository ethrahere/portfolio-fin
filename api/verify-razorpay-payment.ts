import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      res.status(500).json({ error: 'Razorpay is not configured' });
      return;
    }

    const { orderId, paymentId, signature } = req.body ?? {};
    if (!orderId || !paymentId || !signature) {
      res.status(400).json({ error: 'Missing verification fields' });
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const verified = expectedSignature === signature;
    res.status(200).json({ verified });
  } catch (err) {
    console.error('verify-razorpay-payment failed:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
}
