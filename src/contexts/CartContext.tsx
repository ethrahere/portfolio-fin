import React, { createContext, useContext, useState, useCallback } from 'react';
import { shopifyConfigured, createShopifyCart } from '../lib/shopify';

export interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: string;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  shopifyReady: boolean;
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
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) {
        return prev.map(i =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i
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

    if (!shopifyConfigured) {
      const body = items
        .map(i => `${i.name} x${i.quantity} — ${i.price}`)
        .join('\n');
      window.location.href = `mailto:ethra.here@gmail.com?subject=Purchase%20Enquiry&body=${encodeURIComponent(body)}`;
      return;
    }

    setCheckingOut(true);
    try {
      const cart = await createShopifyCart(
        items.map(i => ({ variantId: i.variantId, quantity: i.quantity }))
      );
      window.location.href = cart.checkoutUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Checkout error:', msg);
      alert(`Checkout failed: ${msg}\n\nPlease email ethra.here@gmail.com to purchase.`);
    } finally {
      setCheckingOut(false);
    }
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
        shopifyReady: shopifyConfigured,
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
