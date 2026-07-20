import React, { createContext, useContext, useState, useCallback } from 'react';
import { razorpayConfigured, loadRazorpayScript, openRazorpayCheckout } from '../lib/razorpay';

export interface CartItem {
  id: string;
  imageId: string;
  name: string;
  price: string;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  razorpayReady: boolean;
  checkingOut: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.imageId === item.imageId);
      if (existing) {
        return prev.map(i =>
          i.imageId === item.imageId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, id: crypto.randomUUID(), quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const checkout = useCallback(async () => {
    if (items.length === 0) return;

    if (!razorpayConfigured) {
      const body = items
        .map(i => `${i.name} x${i.quantity} — ${i.price}`)
        .join('\n');
      window.location.href = `mailto:ethra.here@gmail.com?subject=Purchase%20Enquiry&body=${encodeURIComponent(body)}`;
      return;
    }

    setCheckingOut(true);
    try {
      const orderRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ imageId: i.imageId, quantity: i.quantity })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Could not load Razorpay checkout');

      openRazorpayCheckout({
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ETHRA',
        description: items.map(i => `${i.name} x${i.quantity}`).join(', '),
        theme: { color: '#000000' },
        handler: async response => {
          try {
            const verifyRes = await fetch('/api/verify-razorpay-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              setItems([]);
              setIsOpen(false);
              alert('Payment successful! Thank you for your purchase.');
            } else {
              alert('Payment could not be verified. Please email ethra.here@gmail.com with your payment ID.');
            }
          } finally {
            setCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => setCheckingOut(false),
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Checkout error:', msg);
      alert(`Checkout failed: ${msg}\n\nPlease email ethra.here@gmail.com to purchase.`);
      setCheckingOut(false);
    }
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
        razorpayReady: razorpayConfigured,
        checkingOut,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
