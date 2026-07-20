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
  const [selectedImage, setSelectedImage] = useState(0);
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
    if (!img.razorpay_amount) return;

    addItem({
      imageId: img.id,
      name: img.name || project?.title || 'Item',
      price: img.price || project?.price || '',
      imageUrl: img.image_url,
    });

    setAddedIds(prev => new Set(prev).add(img.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const s = new Set(prev);
        s.delete(img.id);
        return s;
      });
    }, 2000);
  };

  const handleEmailPurchase = (img: NonNullable<Project['images']>[number]) => {
    const subject = encodeURIComponent(`Purchase Enquiry — ${img.name || project?.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in purchasing:\n\n${img.name || project?.title}\n${img.price || project?.price || ''}\n\nPlease let me know how to proceed.\n\nThank you.`
    );
    window.location.href = `mailto:ethra.here@gmail.com?subject=${subject}&body=${body}`;
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
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
        >
          <ArrowLeft size={16} /> DROPS
        </Link>
        <div className="text-sm font-mono text-gray-400">DROP NOT FOUND</div>
      </div>
    );
  }

  const purchasableImages =
    project.images?.filter(img => img.name || img.price || img.razorpay_amount) || [];

  const galleryImages = project.images || [];
  const displayImage = galleryImages[selectedImage] ?? galleryImages[0];

  return (
    <>
      <Helmet>
        <title>{project.title} | ETHRA Drops</title>
        <meta name="description" content={project.description?.substring(0, 160)} />
      </Helmet>

      <CartDrawer />

      <div className="min-h-screen text-black bg-white/50 p-8 md:p-16">
        <div className="max-w-5xl mx-auto">

          {/* Nav bar */}
          <div className="flex items-center justify-between mb-16">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline"
            >
              <ArrowLeft size={16} />
              DROPS
            </Link>
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 border border-black px-4 py-2 font-mono text-sm hover:bg-black hover:text-white transition-colors flex-shrink-0"
            >
              <ShoppingBag size={16} />
              CART
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Drop label */}
          <p className="text-xs font-mono tracking-widest text-gray-400 mb-6">
            ONE OF ONE — {project.year}
          </p>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-mono tracking-wide mb-16">
            {project.title}
          </h1>

          {/* Main layout: gallery + story side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">

            {/* Gallery column */}
            <div>
              {displayImage && (
                <div className="aspect-square border border-black overflow-hidden mb-4">
                  <img
                    src={displayImage.image_url}
                    alt={displayImage.alt_text || displayImage.name || project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Thumbnail strip */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 border overflow-hidden transition-colors ${
                        idx === selectedImage ? 'border-black' : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={img.alt_text || img.name || `Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Story + purchase column */}
            <div className="flex flex-col">
              {/* Project-level price */}
              {project.price && (
                <p className="text-2xl font-mono tracking-wide mb-10">{project.price}</p>
              )}

              {/* Story */}
              {project.description && (
                <div className="text-sm font-mono leading-relaxed mb-12 flex-1">
                  <p className="text-xs tracking-widest text-gray-400 mb-4">THE STORY</p>
                  <MarkdownRenderer content={project.description} />
                </div>
              )}

              {/* Medium / dimensions if set */}
              {(project.medium || project.dimensions) && (
                <dl className="text-sm font-mono space-y-2 mb-10 border-t border-black pt-6">
                  {project.medium && (
                    <div className="flex gap-6">
                      <dt className="text-gray-400 w-28 flex-shrink-0">MEDIUM</dt>
                      <dd>{project.medium}</dd>
                    </div>
                  )}
                  {project.dimensions && (
                    <div className="flex gap-6">
                      <dt className="text-gray-400 w-28 flex-shrink-0">DIMENSIONS</dt>
                      <dd>{project.dimensions}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </div>

          {/* Purchasable items */}
          {purchasableImages.length > 0 && (
            <section>
              <p className="text-xs font-mono tracking-widest text-gray-400 mb-8 border-t border-black pt-8">
                {purchasableImages.length === 1 ? 'THE PIECE' : 'THE PIECES'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {purchasableImages.map(img => {
                  const canBuy = !!(img.razorpay_amount);
                  const justAdded = addedIds.has(img.id);
                  const itemPrice = img.price || project.price;

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
                      {itemPrice && (
                        <p className="text-sm font-mono text-gray-600 mb-4">{itemPrice}</p>
                      )}

                      {canBuy ? (
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
                      ) : (
                        <button
                          onClick={() => handleEmailPurchase(img)}
                          className="mt-auto flex items-center justify-center gap-2 text-xs font-mono tracking-widest py-3 border border-black hover:bg-black hover:text-white transition-colors duration-300"
                        >
                          SHOP NOW →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* If no purchasable images but project has price — single piece CTA */}
          {purchasableImages.length === 0 && project.price && (
            <div className="border-t border-black pt-8">
              <p className="text-2xl font-mono tracking-wide mb-6">{project.price}</p>
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`Purchase Enquiry — ${project.title}`);
                  const body = encodeURIComponent(
                    `Hi,\n\nI'm interested in purchasing: ${project.title} (${project.price})\n\nPlease let me know how to proceed.\n\nThank you.`
                  );
                  window.location.href = `mailto:ethra.here@gmail.com?subject=${subject}&body=${body}`;
                }}
                className="inline-flex items-center gap-3 border border-black px-8 py-4 text-sm font-mono tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
              >
                <ShoppingBag size={16} />
                SHOP NOW
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ShopProject;
