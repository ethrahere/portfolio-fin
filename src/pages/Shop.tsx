import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ShoppingCart, X } from 'lucide-react';
import { getShopProjects, Project, ProjectImage } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import CartDrawer from '../components/CartDrawer';

interface ShopItem {
  image: ProjectImage;
  project: Project;
}

const Shop: React.FC = () => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { itemCount, openCart, addItem } = useCart();

  useEffect(() => {
    getShopProjects()
      .then(projects => {
        const flat: ShopItem[] = [];
        for (const project of projects) {
          for (const image of project.images || []) {
            if (image.name || image.price || image.shopify_variant_id) {
              flat.push({ image, project });
            }
          }
        }
        setItems(flat);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (item: ShopItem) => {
    if (!item.image.shopify_variant_id) return;
    addItem({
      variantId: item.image.shopify_variant_id,
      name: item.image.name || item.project.title,
      price: item.image.price || item.project.price || '',
      imageUrl: item.image.image_url,
    });
    setAddedId(item.image.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleEmailPurchase = (item: ShopItem) => {
    const name = item.image.name || item.project.title;
    const price = item.image.price || item.project.price || '';
    const subject = encodeURIComponent(`Purchase Enquiry — ${name}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in purchasing:\n\n${name}\n${price}\n\nPlease let me know how to proceed.\n\nThank you.`
    );
    window.location.href = `mailto:ethra.here@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Helmet>
        <title>Shop | ETHRA</title>
        <meta name="description" content="Objects and prints by ETHRA." />
      </Helmet>

      <CartDrawer />

      {/* Item modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white max-w-md w-full mx-4 p-8 relative font-mono"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 hover:opacity-60 transition-opacity"
            >
              <X size={18} />
            </button>

            <div className="aspect-square border border-black overflow-hidden mb-6">
              <img
                src={selectedItem.image.image_url}
                alt={selectedItem.image.alt_text || selectedItem.image.name || selectedItem.project.title}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedItem.image.name && (
              <h2 className="text-sm tracking-widest mb-3">{selectedItem.image.name}</h2>
            )}

            {selectedItem.image.alt_text && (
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {selectedItem.image.alt_text}
              </p>
            )}

            {(selectedItem.image.price || selectedItem.project.price) && (
              <p className="text-base tracking-wide mb-6">
                {selectedItem.image.price || selectedItem.project.price}
              </p>
            )}

            {selectedItem.image.shopify_variant_id ? (
              <button
                onClick={() => handleAddToCart(selectedItem)}
                className={`w-full flex items-center justify-center gap-2 text-xs tracking-widest py-4 border transition-colors duration-300 ${
                  addedId === selectedItem.image.id
                    ? 'bg-black text-white border-black'
                    : 'border-black hover:bg-black hover:text-white'
                }`}
              >
                <ShoppingCart size={14} />
                {addedId === selectedItem.image.id ? 'ADDED ✓' : 'ADD TO CART'}
              </button>
            ) : (
              <button
                onClick={() => handleEmailPurchase(selectedItem)}
                className="w-full flex items-center justify-center gap-2 text-xs tracking-widest py-4 border border-black hover:bg-black hover:text-white transition-colors duration-300"
              >
                <ShoppingBag size={14} />
                ENQUIRE
              </button>
            )}
          </div>
        </div>
      )}

      <div className="min-h-screen text-black bg-white/50 p-8 md:p-16">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <header className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                className="text-xs font-mono tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors duration-300"
              >
                HOME
              </Link>
              <button
                onClick={openCart}
                className="group flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                <ShoppingBag size={14} />
                CART
                {itemCount > 0 && (
                  <span className="bg-black text-white text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono tracking-wide">SHOP</h1>
          </header>

          {loading ? (
            <div className="text-sm font-mono">LOADING...</div>
          ) : items.length === 0 ? (
            <div className="text-sm font-mono text-gray-400">COMING SOON.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map(({ image, project }) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedItem({ image, project })}
                  className="group text-left"
                >
                  <div className="aspect-square border border-black overflow-hidden mb-3">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || image.name || project.title}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-300"
                      loading="lazy"
                    />
                  </div>
                  {image.name && (
                    <p className="text-xs font-mono tracking-widest mb-1">{image.name}</p>
                  )}
                  {(image.price || project.price) && (
                    <p className="text-xs font-mono text-gray-500">{image.price || project.price}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
