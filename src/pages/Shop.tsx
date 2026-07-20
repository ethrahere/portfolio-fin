import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ShoppingCart, X, ChevronRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { getShopProjects, getThumbnailForProject, Project, ProjectImage } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

interface ShopItem {
  image: ProjectImage;
  project: Project;
}

type ShopSection = 'all' | 'drops' | 'charm-set' | 'wares';

const Shop: React.FC = () => {
  const [shopProjects, setShopProjects] = useState<Project[]>([]);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopSection, setShopSection] = useState<ShopSection>('drops');
  const [selectedDrop, setSelectedDrop] = useState<Project | null>(null);
  const [selectedCharmItem, setSelectedCharmItem] = useState<ShopItem | null>(null);
  const [selectedWaresItem, setSelectedWaresItem] = useState<ShopItem | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    getShopProjects()
      .then(setShopProjects)
      .catch(console.error)
      .finally(() => setShopLoading(false));
  }, []);

  // Add a drop (art piece) to cart
  const handleAddDropToCart = useCallback((drop: Project) => {
    const purchasable = drop.images?.find(img => img.razorpay_amount);
    if (!purchasable?.razorpay_amount) return;
    addItem({
      imageId: purchasable.id,
      name: drop.title,
      price: drop.price || '',
      imageUrl: getThumbnailForProject(drop),
    });
    setAddedId(drop.id);
    setTimeout(() => setAddedId(null), 2000);
  }, [addItem]);

  const handleEmailDrop = useCallback((drop: Project) => {
    const subject = encodeURIComponent(`Purchase Enquiry — ${drop.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in purchasing: ${drop.title}${drop.price ? ` (${drop.price})` : ''}\n\nPlease let me know how to proceed.\n\nThank you.`
    );
    window.location.href = `mailto:ethra.here@gmail.com?subject=${subject}&body=${body}`;
  }, []);

  // Add a charm to cart
  const handleAddCharmToCart = useCallback((item: ShopItem) => {
    if (!item.image.razorpay_amount) return;
    addItem({
      imageId: item.image.id,
      name: item.image.name || item.project.title,
      price: item.image.price || item.project.price || '',
      imageUrl: item.image.image_url,
    });
    setAddedId(item.image.id);
    setTimeout(() => setAddedId(null), 2000);
  }, [addItem]);

  const handleEmailCharm = useCallback((item: ShopItem) => {
    const name = item.image.name || item.project.title;
    const price = item.image.price || item.project.price || '';
    const subject = encodeURIComponent(`Purchase Enquiry — ${name}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in purchasing:\n\n${name}\n${price}\n\nPlease let me know how to proceed.\n\nThank you.`
    );
    window.location.href = `mailto:ethra.here@gmail.com?subject=${subject}&body=${body}`;
  }, []);

  // Split projects into sections
  const charmProject = shopProjects.find(p => p.slug === 'charm-set') || null;
  const waresProject = shopProjects.find(p => p.slug === 'wares') || null;
  const artDrops = shopProjects.filter(p => p.slug !== 'charm-set' && p.slug !== 'wares');
  const currentDrop = artDrops[0] || null;
  const pastDrops = artDrops.slice(1);
  const charmItems: ShopItem[] = (charmProject?.images || [])
    .filter(img => img.name || img.price || img.razorpay_amount)
    .map(img => ({ image: img, project: charmProject! }));
  const waresItems: ShopItem[] = (waresProject?.images || [])
    .filter(img => img.name || img.price || img.razorpay_amount)
    .map(img => ({ image: img, project: waresProject! }));

  return (
    <AppLayout sectionLabel="SHOP">
      <Helmet>
        <title>Shop | ETHRA</title>
        <meta name="description" content="Objects and prints by ETHRA." />
      </Helmet>

      <div className="p-8 md:p-16">
        {/* Past drop modal */}
        {selectedDrop && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setSelectedDrop(null)}
          >
            <div
              className="bg-white max-w-md w-full mx-4 font-mono overflow-y-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-end px-4 pt-4 pb-2">
                <button
                  onClick={() => setSelectedDrop(null)}
                  className="hover:opacity-60 transition-opacity"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-8 pb-8">
                <div className="aspect-square border border-black overflow-hidden mb-6">
                  <img
                    src={getThumbnailForProject(selectedDrop)}
                    alt={selectedDrop.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-sm tracking-widest mb-1">{selectedDrop.title}</h2>
                <p className="text-xs text-gray-400 tracking-widest mb-4">{selectedDrop.year}</p>

                {selectedDrop.description && (
                  <div className="text-xs text-gray-600 leading-relaxed mb-4">
                    <MarkdownRenderer content={selectedDrop.description} />
                  </div>
                )}

                {selectedDrop.price && (
                  <p className="text-base tracking-wide mb-6">{selectedDrop.price}</p>
                )}

                {selectedDrop.images?.some(img => img.razorpay_amount) ? (
                  <button
                    onClick={() => handleAddDropToCart(selectedDrop)}
                    className={`w-full flex items-center justify-center gap-2 text-xs tracking-widest py-4 border transition-colors duration-300 ${
                      addedId === selectedDrop.id
                        ? 'bg-black text-white border-black'
                        : 'border-black hover:bg-black hover:text-white'
                    }`}
                  >
                    <ShoppingCart size={14} />
                    {addedId === selectedDrop.id ? 'ADDED ✓' : 'ADD TO CART'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleEmailDrop(selectedDrop)}
                    className="w-full flex items-center justify-center gap-2 text-xs tracking-widest py-4 border border-black hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    <ShoppingBag size={14} />
                    ENQUIRE
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wares item modal */}
        {selectedWaresItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setSelectedWaresItem(null)}
          >
            <div
              className="bg-white max-w-md w-full mx-4 font-mono overflow-y-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-end px-4 pt-4 pb-2">
                <button
                  onClick={() => setSelectedWaresItem(null)}
                  className="hover:opacity-60 transition-opacity"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-8 pb-8">
                <div className="aspect-square border border-black overflow-hidden mb-6">
                  <img
                    src={selectedWaresItem.image.image_url}
                    alt={selectedWaresItem.image.alt_text || selectedWaresItem.image.name || ''}
                    className="w-full h-full object-cover"
                  />
                </div>

                {selectedWaresItem.image.name && (
                  <h2 className="text-sm tracking-widest mb-3">{selectedWaresItem.image.name}</h2>
                )}
                {selectedWaresItem.project.description && (
                  <div className="text-xs text-gray-600 leading-relaxed mb-4">
                    <MarkdownRenderer content={selectedWaresItem.project.description} />
                  </div>
                )}
                {(selectedWaresItem.image.price || selectedWaresItem.project.price) && (
                  <p className="text-base tracking-wide mb-6">
                    {selectedWaresItem.image.price || selectedWaresItem.project.price}
                  </p>
                )}

                {selectedWaresItem.image.razorpay_amount ? (
                  <button
                    onClick={() => handleAddCharmToCart(selectedWaresItem)}
                    className={`w-full flex items-center justify-center gap-2 text-xs tracking-widest py-4 border transition-colors duration-300 ${
                      addedId === selectedWaresItem.image.id
                        ? 'bg-black text-white border-black'
                        : 'border-black hover:bg-black hover:text-white'
                    }`}
                  >
                    <ShoppingCart size={14} />
                    {addedId === selectedWaresItem.image.id ? 'ADDED ✓' : 'ADD TO CART'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleEmailCharm(selectedWaresItem)}
                    className="w-full flex items-center justify-center gap-2 text-xs tracking-widest py-4 border border-black hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    <ShoppingBag size={14} />
                    ENQUIRE
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Charm item modal */}
        {selectedCharmItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setSelectedCharmItem(null)}
          >
            <div
              className="bg-white max-w-md w-full mx-4 font-mono overflow-y-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-end px-4 pt-4 pb-2">
                <button
                  onClick={() => setSelectedCharmItem(null)}
                  className="hover:opacity-60 transition-opacity"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-8 pb-8">
                <div className="aspect-square border border-black overflow-hidden mb-6">
                  <img
                    src={selectedCharmItem.image.image_url}
                    alt={selectedCharmItem.image.alt_text || selectedCharmItem.image.name || ''}
                    className="w-full h-full object-cover"
                  />
                </div>

                {selectedCharmItem.image.name && (
                  <h2 className="text-sm tracking-widest mb-3">{selectedCharmItem.image.name}</h2>
                )}
                {selectedCharmItem.image.alt_text && (
                  <div className="text-xs text-gray-600 leading-relaxed mb-4">
                    <MarkdownRenderer content={selectedCharmItem.image.alt_text} />
                  </div>
                )}
                {(selectedCharmItem.image.price || selectedCharmItem.project.price) && (
                  <p className="text-base tracking-wide mb-6">
                    {selectedCharmItem.image.price || selectedCharmItem.project.price}
                  </p>
                )}

                {selectedCharmItem.image.razorpay_amount ? (
                  <button
                    onClick={() => handleAddCharmToCart(selectedCharmItem)}
                    className={`w-full flex items-center justify-center gap-2 text-xs tracking-widest py-4 border transition-colors duration-300 ${
                      addedId === selectedCharmItem.image.id
                        ? 'bg-black text-white border-black'
                        : 'border-black hover:bg-black hover:text-white'
                    }`}
                  >
                    <ShoppingCart size={14} />
                    {addedId === selectedCharmItem.image.id ? 'ADDED ✓' : 'ADD TO CART'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleEmailCharm(selectedCharmItem)}
                    className="w-full flex items-center justify-center gap-2 text-xs tracking-widest py-4 border border-black hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    <ShoppingBag size={14} />
                    ENQUIRE
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-3xl md:text-4xl font-mono tracking-wide">SHOP</h1>
        </header>

        {/* Category tabs */}
        <div className="flex border border-black mb-10 flex-shrink-0">
          <button
            onClick={() => setShopSection('all')}
            className={`flex-1 text-xs font-mono tracking-widest py-3 transition-colors duration-200 ${
              shopSection === 'all' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setShopSection('drops')}
            className={`flex-1 text-xs font-mono tracking-widest py-3 border-l border-black transition-colors duration-200 ${
              shopSection === 'drops' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            ONE-OF-ONE
          </button>
          <button
            onClick={() => setShopSection('charm-set')}
            className={`flex-1 text-xs font-mono tracking-widest py-3 border-l border-black transition-colors duration-200 ${
              shopSection === 'charm-set' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            CHARM SET
          </button>
          <button
            onClick={() => setShopSection('wares')}
            className={`flex-1 text-xs font-mono tracking-widest py-3 border-l border-black transition-colors duration-200 ${
              shopSection === 'wares' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            WARES
          </button>
        </div>

        {shopLoading ? (
          <div className="text-sm font-mono">LOADING...</div>
        ) : shopSection === 'all' ? (
          // ── ALL items ─────────────────────────────────────────────────────
          <div className="flex flex-col gap-10">
            {artDrops.length === 0 && charmItems.length === 0 && waresItems.length === 0 ? (
              <p className="text-sm font-mono text-gray-400">COMING SOON.</p>
            ) : (
              <>
                {artDrops.length > 0 && (
                  <div>
                    <p className="text-xs font-mono tracking-widest text-gray-400 mb-6">ONE-OF-ONE</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {artDrops.map(drop => (
                        <button
                          key={drop.id}
                          onClick={() => setSelectedDrop(drop)}
                          className="group text-left"
                        >
                          <div className="aspect-square border border-black overflow-hidden mb-3">
                            <img
                              src={getThumbnailForProject(drop)}
                              alt={drop.title}
                              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-300"
                              loading="lazy"
                            />
                          </div>
                          <p className="text-xs font-mono tracking-widest mb-1">{drop.title}</p>
                          {drop.price && (
                            <p className="text-xs font-mono text-gray-500">{drop.price}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {charmItems.length > 0 && (
                  <div>
                    <p className="text-xs font-mono tracking-widest text-gray-400 mb-6 border-t border-black pt-8">CHARM SET</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {charmItems.map(({ image, project }) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedCharmItem({ image, project })}
                          className="group text-left"
                        >
                          <div className="aspect-square bg-gray-100 border border-black overflow-hidden mb-3">
                            <img
                              src={image.image_url}
                              alt={image.alt_text || image.name || ''}
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
                  </div>
                )}
                {waresItems.length > 0 && (
                  <div>
                    <p className="text-xs font-mono tracking-widest text-gray-400 mb-6 border-t border-black pt-8">WARES</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {waresItems.map(({ image, project }) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedWaresItem({ image, project })}
                          className="group text-left"
                        >
                          <div className="aspect-square border border-black overflow-hidden mb-3">
                            <img
                              src={image.image_url}
                              alt={image.alt_text || image.name || ''}
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
                  </div>
                )}
              </>
            )}
          </div>
        ) : shopSection === 'drops' ? (
          // ── ONE-OF-ONE drops ───────────────────────────────────────────────
          <div className="flex flex-col gap-16">
            {/* Current drop */}
            {currentDrop ? (
              <div>
                <p className="text-xs font-mono tracking-widest text-gray-400 mb-6">CURRENT DROP</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="aspect-square border border-black overflow-hidden">
                    <img
                      src={getThumbnailForProject(currentDrop)}
                      alt={currentDrop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-mono tracking-wide">{currentDrop.title}</h3>
                    <p className="text-xs font-mono text-gray-400 tracking-widest">{currentDrop.year}</p>
                    {currentDrop.description && (
                      <div className="text-xs font-mono leading-relaxed text-gray-600">
                        <MarkdownRenderer content={currentDrop.description} />
                      </div>
                    )}
                    {currentDrop.price && (
                      <p className="text-base font-mono tracking-wide">{currentDrop.price}</p>
                    )}
                    {currentDrop.images?.some(img => img.razorpay_amount) ? (
                      <button
                        onClick={() => handleAddDropToCart(currentDrop)}
                        className={`flex items-center justify-center gap-2 text-xs font-mono tracking-widest py-4 border transition-colors duration-300 ${
                          addedId === currentDrop.id
                            ? 'bg-black text-white border-black'
                            : 'border-black hover:bg-black hover:text-white'
                        }`}
                      >
                        <ShoppingCart size={14} />
                        {addedId === currentDrop.id ? 'ADDED ✓' : 'ADD TO CART'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEmailDrop(currentDrop)}
                        className="flex items-center justify-center gap-2 text-xs font-mono tracking-widest py-4 border border-black hover:bg-black hover:text-white transition-colors duration-300"
                      >
                        <ShoppingBag size={14} />
                        ENQUIRE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm font-mono text-gray-400">FIRST DROP COMING SOON.</p>
            )}

            {/* Past drops */}
            {pastDrops.length > 0 && (
              <div>
                <p className="text-xs font-mono tracking-widest text-gray-400 mb-4 border-t border-black pt-8">
                  PAST DROPS
                </p>
                <div className="flex flex-col divide-y divide-black border-b border-black">
                  {pastDrops.map(drop => (
                    <button
                      key={drop.id}
                      onClick={() => setSelectedDrop(drop)}
                      className="flex items-center gap-4 py-4 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="w-14 h-14 border border-black overflow-hidden flex-shrink-0">
                        <img
                          src={getThumbnailForProject(drop)}
                          alt={drop.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono tracking-widest truncate">{drop.title}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{drop.year}</p>
                      </div>
                      {drop.price && (
                        <p className="text-xs font-mono text-gray-600 flex-shrink-0">{drop.price}</p>
                      )}
                      <ChevronRight size={14} className="flex-shrink-0 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : shopSection === 'charm-set' ? (
          // ── Charm set ──────────────────────────────────────────────────────
          <div className="flex flex-col gap-10">
            {/* Description */}
            <div className="border border-black p-6 font-mono">
              {charmProject?.description ? (
                <div className="text-sm leading-relaxed">
                  <MarkdownRenderer content={charmProject.description} />
                </div>
              ) : (
                <div className="text-sm leading-relaxed text-gray-700 space-y-3">
                  <p className="tracking-widest font-semibold">BUILD YOUR OWN CHARM SET.</p>
                  <p>
                    Each set comes with a carabiner — take as many as you like.
                    Mix and match from handmade charms below: chainmail pieces,
                    beads, hearts, and more. Add each charm individually to your cart
                    and we'll assemble your set.
                  </p>
                </div>
              )}
            </div>

            {/* Charms grid */}
            {charmItems.length > 0 ? (
              <div>
                <p className="text-xs font-mono tracking-widest text-gray-400 mb-6">CHOOSE YOUR CHARMS</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {charmItems.map(({ image, project }) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedCharmItem({ image, project })}
                      className="group text-left"
                    >
                      <div className="aspect-square bg-gray-100 border border-black overflow-hidden mb-3">
                        <img
                          src={image.image_url}
                          alt={image.alt_text || image.name || ''}
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
              </div>
            ) : (
              <p className="text-sm font-mono text-gray-400">CHARMS COMING SOON.</p>
            )}
          </div>
        ) : (
          // ── Wares ──────────────────────────────────────────────────────────
          <div className="flex flex-col gap-10">
            {waresItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {waresItems.map(({ image, project }) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedWaresItem({ image, project })}
                    className="group text-left"
                  >
                    <div className="aspect-square border border-black overflow-hidden mb-3">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || image.name || ''}
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
            ) : (
              <p className="text-sm font-mono text-gray-400">WARES COMING SOON.</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Shop;
