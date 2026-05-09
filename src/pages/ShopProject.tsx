import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingBag, ShoppingCart } from 'lucide-react';
import { getShopProject, Project } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import CartDrawer from '../components/CartDrawer';
import MarkdownRenderer from '../components/MarkdownRenderer';

const ShopProject: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { itemCount, openCart, addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    getShopProject(slug)
      .then(setProject)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = (img: NonNullable<Project['images']>[number]) => {
    if (!img.shopify_variant_id) return;

    addItem({
      variantId: img.shopify_variant_id,
      name: img.name || project?.title || 'Item',
      price: img.price || '',
      imageUrl: img.image_url,
    });

    setAddedIds(prev => new Set(prev).add(img.id));
    setTimeout(() => {
      setAddedIds(prev => { const s = new Set(prev); s.delete(img.id); return s; });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
        <div className="text-sm font-mono">LOADING...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8">
          <ArrowLeft size={16} /> SHOP
        </Link>
        <div className="text-sm font-mono">ITEM NOT FOUND</div>
      </div>
    );
  }

  const purchasableImages = project.images?.filter(img => img.name || img.price || img.shopify_variant_id) || [];

  return (
    <>
      <Helmet>
        <title>{project.title} | ETHRA Shop</title>
        <meta name="description" content={project.description?.substring(0, 160)} />
      </Helmet>

      <CartDrawer />

      <div className="min-h-screen text-black bg-white/50 p-8 md:p-16">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-start justify-between mb-16">
            <div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
              >
                <ArrowLeft size={16} />
                SHOP
              </Link>
              <h1 className="text-3xl md:text-4xl font-mono tracking-wide mb-4">
                {project.title}
              </h1>
            </div>
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 border border-black px-4 py-2 font-mono text-sm hover:bg-black hover:text-white transition-colors mt-8 flex-shrink-0"
            >
              <ShoppingBag size={16} />
              CART
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </header>

          {/* Project description */}
          {project.description && (
            <div className="max-w-2xl mb-16">
              <MarkdownRenderer content={project.description} />
            </div>
          )}

          {/* Product grid */}
          {purchasableImages.length === 0 ? (
            <div className="text-sm font-mono text-gray-500">NO ITEMS AVAILABLE YET</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {purchasableImages.map(img => {
                const canBuy = !!(img.shopify_variant_id);
                const justAdded = addedIds.has(img.id);

                return (
                  <div key={img.id} className="flex flex-col">
                    <div className="aspect-square border border-black overflow-hidden mb-4">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || img.name || project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {img.name && (
                      <h2 className="text-sm font-mono tracking-widest mb-1">{img.name}</h2>
                    )}
                    {img.price && (
                      <p className="text-sm font-mono text-gray-600 mb-4">{img.price}</p>
                    )}

                    {canBuy && (
                      <button
                        onClick={() => handleAddToCart(img)}
                        className={`mt-auto flex items-center justify-center gap-2 text-xs font-mono tracking-widest py-3 border transition-colors duration-300 ${
                          justAdded
                            ? 'bg-black text-white border-black'
                            : 'border-black hover:bg-black hover:text-white'
                        }`}
                      >
                        <ShoppingCart size={14} />
                        {justAdded ? 'ADDED ✓' : 'ADD TO CART'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopProject;
