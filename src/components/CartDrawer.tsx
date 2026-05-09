import React from 'react';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartDrawer: React.FC = () => {
  const { items, isOpen, itemCount, closeCart, removeItem, checkout, checkingOut, shopifyReady } = useCart();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={closeCart}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white border-l border-black z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-black flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} />
            <span className="font-mono text-sm tracking-widest">CART ({itemCount})</span>
          </div>
          <button onClick={closeCart} className="p-1 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-sm font-mono text-gray-400 text-center mt-20">YOUR CART IS EMPTY</p>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 border border-black p-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono leading-tight">{item.name}</p>
                    <p className="text-sm font-mono text-gray-500 mt-1">{item.price}</p>
                    <p className="text-xs font-mono text-gray-400 mt-1">QTY {item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-gray-400 hover:text-black flex-shrink-0 self-start"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-black flex-shrink-0 space-y-3">
            <button
              onClick={checkout}
              disabled={checkingOut}
              className="w-full bg-black text-white font-mono text-sm py-4 tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {checkingOut ? 'REDIRECTING...' : 'CHECKOUT'}
            </button>
            <p className="text-xs font-mono text-gray-400 text-center">
              {shopifyReady ? 'Secure checkout via Shopify' : 'Opens email enquiry'}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
