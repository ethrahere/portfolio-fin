import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail, ArrowLeft, ExternalLink, ChevronDown, MessageSquare, ShoppingBag, ShoppingCart, X, ChevronRight } from 'lucide-react';
import { getProjectsByCategory, getThumbnailForProject, getProject, getShopProjects, Project, ProjectImage } from '../lib/supabase';
import ImageGallery from '../components/ImageGallery';
import VideoGallery from '../components/VideoGallery';
import MarkdownRenderer from '../components/MarkdownRenderer';
import VineCursorCanvas from '../components/VineCursorCanvas';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../contexts/CartContext';

interface ShopItem {
  image: ProjectImage;
  project: Project;
}

type ViewState =
  | { type: 'home' }
  | { type: 'shop' }
  | { type: 'category'; slug: string; name: string }
  | { type: 'project'; categorySlug: string; projectSlug: string };

type ShopSection = 'all' | 'drops' | 'charm-set' | 'wares';

const Home = () => {
  const [viewState, setViewState] = useState<ViewState>(() =>
    window.innerWidth < 1024 ? { type: 'shop' } : { type: 'home' }
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);

  // Shop state
  const [shopProjects, setShopProjects] = useState<Project[]>([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopSection, setShopSection] = useState<ShopSection>('drops');
  const [selectedDrop, setSelectedDrop] = useState<Project | null>(null);
  const [selectedCharmItem, setSelectedCharmItem] = useState<ShopItem | null>(null);
  const [selectedWaresItem, setSelectedWaresItem] = useState<ShopItem | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { itemCount, openCart, addItem } = useCart();

  const categories = [
    { slug: '3d', name: '3D' },
    { slug: 'objects', name: 'OBJECTS' },
    { slug: 'apps', name: 'APPS' },
    { slug: 'music', name: 'MUSIC' },
    { slug: 'essays', name: 'ESSAYS' },
    { slug: 'resources', name: 'RESOURCES' },
    { slug: 'bio', name: 'BIO' },
  ];

  const DISCORD_URL = 'https://discord.gg/5kDsbhbF';

  // Load shop projects when shop view is active
  useEffect(() => {
    if (viewState.type !== 'shop') return;
    setShopLoading(true);
    getShopProjects()
      .then(setShopProjects)
      .catch(console.error)
      .finally(() => setShopLoading(false));
  }, [viewState]);

  // Load projects when category is selected
  useEffect(() => {
    if (viewState.type !== 'category') return;
    setLoading(true);
    getProjectsByCategory(viewState.slug)
      .then(setProjects)
      .catch(err => console.error('Error fetching projects:', err))
      .finally(() => setLoading(false));
  }, [viewState]);

  // Load project details when project is selected
  useEffect(() => {
    if (viewState.type !== 'project') return;
    setLoading(true);
    getProject(viewState.categorySlug, viewState.projectSlug)
      .then(data => { setCurrentProject(data); setSelectedTrack(0); })
      .catch(err => console.error('Error fetching project:', err))
      .finally(() => setLoading(false));
  }, [viewState]);

  const handleCategoryClick = (slug: string, name: string) => {
    setViewState({ type: 'category', slug, name });
  };

  const handleProjectClick = (categorySlug: string, projectSlug: string) => {
    setViewState({ type: 'project', categorySlug, projectSlug });
  };

  const handleBackClick = () => {
    if (viewState.type === 'project') {
      const category = categories.find(c => c.slug === viewState.categorySlug);
      if (category) setViewState({ type: 'category', slug: category.slug, name: category.name });
    } else {
      setViewState({ type: 'home' });
    }
  };

  // Add a drop (art piece) to cart
  const handleAddDropToCart = useCallback((drop: Project) => {
    const variant = drop.images?.find(img => img.shopify_variant_id);
    if (!variant?.shopify_variant_id) return;
    addItem({
      variantId: variant.shopify_variant_id,
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
    if (!item.image.shopify_variant_id) return;
    addItem({
      variantId: item.image.shopify_variant_id,
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

  // Render right panel content
  const renderRightPanel = () => {
    // ── Shop view ──────────────────────────────────────────────────────────────
    if (viewState.type === 'shop') {
      // Split projects into sections
      const charmProject = shopProjects.find(p => p.slug === 'charm-set') || null;
      const waresProject = shopProjects.find(p => p.slug === 'wares') || null;
      const artDrops = shopProjects.filter(p => p.slug !== 'charm-set' && p.slug !== 'wares');
      const currentDrop = artDrops[0] || null;
      const pastDrops = artDrops.slice(1);
      const charmItems: ShopItem[] = (charmProject?.images || [])
        .filter(img => img.name || img.price || img.shopify_variant_id)
        .map(img => ({ image: img, project: charmProject! }));
      const waresItems: ShopItem[] = (waresProject?.images || [])
        .filter(img => img.name || img.price || img.shopify_variant_id)
        .map(img => ({ image: img, project: waresProject! }));

      return (
        <div className="h-full flex flex-col overflow-y-auto scrollbar-hide">
          {/* Past drop modal */}
          {selectedDrop && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setSelectedDrop(null)}
            >
              <div
                className="bg-white max-w-lg w-full mx-4 p-8 relative font-mono overflow-y-auto max-h-[90vh]"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedDrop(null)}
                  className="absolute top-4 right-4 hover:opacity-60 transition-opacity"
                >
                  <X size={18} />
                </button>

                <div className="aspect-square border border-black overflow-hidden mb-6">
                  <img
                    src={getThumbnailForProject(selectedDrop)}
                    alt={selectedDrop.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-lg tracking-widest mb-1">{selectedDrop.title}</h2>
                <p className="text-xs text-gray-400 tracking-widest mb-4">{selectedDrop.year}</p>

                {selectedDrop.description && (
                  <div className="text-xs leading-relaxed text-gray-600 mb-6">
                    <MarkdownRenderer content={selectedDrop.description} />
                  </div>
                )}

                {selectedDrop.price && (
                  <p className="text-base tracking-wide mb-6">{selectedDrop.price}</p>
                )}

                {selectedDrop.images?.some(img => img.shopify_variant_id) ? (
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
          )}

          {/* Wares item modal */}
          {selectedWaresItem && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setSelectedWaresItem(null)}
            >
              <div
                className="bg-white max-w-md w-full mx-4 font-mono"
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

                {selectedWaresItem.image.shopify_variant_id ? (
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
                className="bg-white max-w-md w-full mx-4 p-8 relative font-mono"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedCharmItem(null)}
                  className="absolute top-4 right-4 hover:opacity-60 transition-opacity"
                >
                  <X size={18} />
                </button>

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
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">{selectedCharmItem.image.alt_text}</p>
                )}
                {(selectedCharmItem.image.price || selectedCharmItem.project.price) && (
                  <p className="text-base tracking-wide mb-6">
                    {selectedCharmItem.image.price || selectedCharmItem.project.price}
                  </p>
                )}

                {selectedCharmItem.image.shopify_variant_id ? (
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
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-mono tracking-wide">SHOP</h2>
            <button
              onClick={openCart}
              className="group hidden lg:flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs tracking-widest hover:bg-black hover:text-white transition-colors"
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
                      {currentDrop.images?.some(img => img.shopify_variant_id) ? (
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
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm font-mono">LOADING...</div>
        </div>
      );
    }

    // ── Category view ──────────────────────────────────────────────────────────
    if (viewState.type === 'category') {
      // Special handling for bio - show content directly
      if (viewState.slug === 'bio' && projects.length > 0) {
        const bioProject = projects[0];
        const bioImages = bioProject.images?.map(img => img.image_url) || [];

        return (
          <div className="h-full flex flex-col overflow-y-auto scrollbar-hide">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
            >
              <ArrowLeft size={16} />
              BACK
            </button>

            <div className="space-y-12">
              <header>
                <h1 className="text-2xl md:text-3xl font-mono tracking-wide mb-4">
                  {bioProject.title}
                </h1>
              </header>

              {bioImages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {bioImages.map((imageUrl, idx) => (
                    <div key={idx} className="border border-black overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${bioProject.title} - Image ${idx + 1}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer content={bioProject.description} />
              </div>
            </div>
          </div>
        );
      }

      // Regular category view - show projects grid
      return (
        <div className="h-full flex flex-col">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
          >
            <ArrowLeft size={16} />
            BACK
          </button>

          <h2 className="text-3xl md:text-4xl font-mono tracking-wide mb-12">
            {viewState.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto items-start scrollbar-hide">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(viewState.slug, project.slug)}
                className="group block text-left w-full"
              >
                <div className="aspect-square bg-gray-100 border border-black overflow-hidden mb-4 group-hover:bg-black transition-colors duration-300">
                  <img
                    src={getThumbnailForProject(project)}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:opacity-90"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-mono tracking-widest group-hover:underline">
                  {project.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ── Project detail view ────────────────────────────────────────────────────
    if (viewState.type === 'project' && currentProject) {
      const projectImages = currentProject.images?.map(img => img.image_url) || [];
      const projectVideos = currentProject.videos?.map(vid => vid.video_url) || [];

      return (
        <div className="h-full flex flex-col overflow-y-auto scrollbar-hide">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-8"
          >
            <ArrowLeft size={16} />
            BACK
          </button>

          <div className="space-y-12">
            <header>
              <h1 className="text-2xl md:text-3xl font-mono tracking-wide mb-4">
                {currentProject.title}
              </h1>
              <p className="text-sm font-mono text-gray-600">
                {currentProject.categories?.[0]?.name} / {currentProject.year}
              </p>
            </header>

            {/* Objects: product grid with per-image name + price */}
            {viewState.categorySlug === 'objects' && currentProject.images && currentProject.images.length > 0 && (
              <div className="grid grid-cols-2 gap-6">
                {currentProject.images.map((img) => (
                  <div key={img.id}>
                    <div className="aspect-square border border-black overflow-hidden mb-2">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || img.name || currentProject.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {img.name && (
                      <p className="text-xs font-mono tracking-widest">{img.name}</p>
                    )}
                    {img.price && (
                      <p className="text-xs font-mono text-gray-600 mt-0.5">{img.price}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Project Gallery + Audio Player (non-objects) */}
            {viewState.categorySlug !== 'objects' && projectImages.length > 0 && (
              <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
                <div className="flex-1">
                  <ImageGallery images={projectImages} projectTitle={currentProject.title} />
                </div>
                {currentProject.audios && currentProject.audios.length > 0 && (
                  <aside className="w-full lg:w-64 mt-8 lg:mt-0">
                    <h2 className="text-sm font-mono mb-4 tracking-widest">AUDIO</h2>
                    <div className="space-y-4">
                      <audio
                        controls
                        className="w-full outline-none border border-black rounded bg-white mb-4"
                        src={currentProject.audios[selectedTrack]?.audio_url}
                        key={currentProject.audios[selectedTrack]?.id}
                      >
                        <source src={currentProject.audios[selectedTrack]?.audio_url} type="audio/mpeg" />
                      </audio>
                      <ul className="space-y-2">
                        {currentProject.audios.map((audio, idx) => (
                          <li key={audio.id}>
                            <button
                              className={`text-xs font-mono truncate w-full text-left px-2 py-1 rounded transition-colors ${selectedTrack === idx ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                              onClick={() => setSelectedTrack(idx)}
                              title={audio.title}
                            >
                              {audio.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </aside>
                )}
              </div>
            )}

            {/* Audio only */}
            {projectImages.length === 0 && currentProject.audios && currentProject.audios.length > 0 && (
              <div className="max-w-md">
                <h2 className="text-sm font-mono mb-4 tracking-widest">AUDIO</h2>
                <div className="space-y-4">
                  <audio
                    controls
                    className="w-full outline-none border border-black rounded bg-white mb-4"
                    src={currentProject.audios[selectedTrack]?.audio_url}
                    key={currentProject.audios[selectedTrack]?.id}
                  >
                    <source src={currentProject.audios[selectedTrack]?.audio_url} type="audio/mpeg" />
                  </audio>
                  <ul className="space-y-2">
                    {currentProject.audios.map((audio, idx) => (
                      <li key={audio.id}>
                        <button
                          className={`text-xs font-mono truncate w-full text-left px-2 py-1 rounded transition-colors ${selectedTrack === idx ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                          onClick={() => setSelectedTrack(idx)}
                          title={audio.title}
                        >
                          {audio.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {projectVideos.length > 0 && (
              <div>
                <h2 className="text-sm font-mono mb-4 tracking-widest">VIDEOS</h2>
                <VideoGallery videos={projectVideos} projectTitle={currentProject.title} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-8">
              <div>
                <h2 className="text-sm font-mono mb-4 tracking-widest">DESCRIPTION</h2>
                <MarkdownRenderer content={currentProject.description} />
              </div>
              <div>
                <h2 className="text-sm font-mono mb-4 tracking-widest">DETAILS</h2>
                {currentProject.app_link && (
                  <a
                    href={currentProject.app_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 mb-4 text-sm font-mono border border-black hover:bg-black hover:text-white px-4 py-3 transition-colors duration-300 w-full"
                  >
                    VISIT APP
                    <ExternalLink size={16} />
                  </a>
                )}
                <dl className="space-y-4 text-sm">
                  {currentProject.price && (
                    <div>
                      <dt className="font-mono text-gray-600">PRICE</dt>
                      <dd className="font-mono">{currentProject.price}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-mono text-gray-600">YEAR</dt>
                    <dd>{currentProject.year}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-gray-600">MEDIUM</dt>
                    <dd>{currentProject.medium}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-gray-600">DIMENSIONS</dt>
                    <dd>{currentProject.dimensions}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Home view ──────────────────────────────────────────────────────────────
    return (
      <div className="w-full h-full">
        <div className="lg:hidden flex flex-col gap-3 pt-4">
          <p className="text-xs font-mono text-gray-400 tracking-widest mb-2">
            ONE-OF-ONE ART PIECES, DROPPED EVERY FRIDAY.
          </p>
          <button
            onClick={() => setViewState({ type: 'shop' })}
            className="text-left text-lg font-mono tracking-widest border border-black px-6 py-4 bg-black text-white flex items-center gap-3"
          >
            <ShoppingBag size={18} />
            SHOP
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug, category.name)}
              className="text-left text-lg font-mono tracking-widest border border-black px-6 py-4 hover:bg-black hover:text-white transition-colors duration-300"
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="hidden lg:block w-full h-full">
          <VineCursorCanvas />
        </div>
      </div>
    );
  };

  const getCurrentViewName = () => {
    if (viewState.type === 'shop') return 'SHOP';
    if (viewState.type === 'category') return viewState.name;
    if (viewState.type === 'project') {
      const category = categories.find(c => c.slug === viewState.categorySlug);
      return category?.name || '3D';
    }
    return '3D';
  };

  return (
    <div className="h-screen text-black bg-white/50 flex flex-col overflow-hidden">
      <CartDrawer />

      {/* Mobile Top Navigation */}
      <nav className="lg:hidden border-b border-black bg-white flex-shrink-0">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-mono tracking-wide">ETHRA</h1>

          <div className="flex items-center gap-3">
            {/* Category / Shop Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowContactDropdown(false); }}
                className="flex items-center gap-2 text-sm font-mono border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
              >
                {getCurrentViewName()}
                <ChevronDown size={14} />
              </button>

              {showCategoryDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-black shadow-lg z-50 min-w-[120px]">
                  <button
                    onClick={() => { setViewState({ type: 'shop' }); setShowCategoryDropdown(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm font-mono hover:bg-black hover:text-white transition-colors ${viewState.type === 'shop' ? 'bg-gray-100' : ''}`}
                  >
                    SHOP
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => { handleCategoryClick(category.slug, category.name); setShowCategoryDropdown(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm font-mono hover:bg-black hover:text-white transition-colors ${viewState.type === 'category' && viewState.slug === category.slug ? 'bg-gray-100' : ''}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="group flex items-center gap-1 text-sm font-mono border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
            >
              <ShoppingBag size={14} />
              {itemCount > 0 && (
                <span className="bg-black text-white text-xs font-mono w-4 h-4 rounded-full flex items-center justify-center leading-none group-hover:bg-white group-hover:text-black transition-colors">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Contact Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowContactDropdown(!showContactDropdown); setShowCategoryDropdown(false); }}
                className="flex items-center gap-2 text-sm font-mono border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
              >
                CONTACT
                <ChevronDown size={14} />
              </button>

              {showContactDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-black shadow-lg z-50">
                  <Link
                    to="/collaborate"
                    onClick={() => setShowContactDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-mono hover:bg-black hover:text-white transition-colors whitespace-nowrap border-b border-gray-200"
                  >
                    COLLABORATE
                  </Link>
                  <a
                    href={DISCORD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-mono hover:bg-black hover:text-white transition-colors whitespace-nowrap border-b border-gray-200"
                  >
                    <MessageSquare size={16} />
                    DISCORD
                  </a>
                  <a
                    href="https://instagram.com/ethra.here"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-mono hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                  >
                    <Instagram size={16} />
                    INSTAGRAM
                  </a>
                  <a
                    href="https://x.com/ethra_here"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-mono hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                  >
                    <Twitter size={16} />
                    TWITTER
                  </a>
                  <a
                    href="mailto:ethra.here@gmail.com"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-mono hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                  >
                    <Mail size={16} />
                    EMAIL
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Desktop Only */}
        <aside className="hidden lg:flex lg:w-[30%] border-r border-black flex-col lg:flex-shrink-0">
          <div className="flex-1 overflow-y-auto p-8 md:p-16">
            <header className="mb-12">
              <h1 className="text-2xl md:text-3xl font-mono tracking-wide">ETHRA</h1>
            </header>

            <div className="mb-10">
              <p className="text-sm font-mono text-gray-600 leading-relaxed">
                ONE-OF-ONE ART PIECES.
              </p>
            </div>

            <nav className="flex flex-col gap-4">
              <button
                onClick={() => setViewState({ type: 'shop' })}
                className={`text-left text-xl font-mono tracking-widest border border-black px-6 py-4 transition-colors duration-300 flex items-center gap-3 ${
                  viewState.type === 'shop' ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
                }`}
              >
                <ShoppingBag size={18} />
                SHOP
                {itemCount > 0 && (
                  <span className="ml-auto bg-white text-black text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryClick(category.slug, category.name)}
                  className={`text-left text-xl font-mono tracking-widest border border-black px-6 py-4 transition-colors duration-300 ${
                    viewState.type === 'category' && viewState.slug === category.slug
                      ? 'bg-black text-white'
                      : 'hover:bg-black hover:text-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>

          <footer className="border-t border-black p-8 md:px-16 md:pb-16 bg-white flex-shrink-0">
            <div className="mb-6 flex flex-col gap-2">
              <Link
                to="/collaborate"
                className="text-sm font-mono tracking-widest border border-black px-4 py-2 text-center hover:bg-black hover:text-white transition-colors duration-300"
              >
                COLLABORATE
              </Link>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono tracking-widest border border-black px-4 py-2 text-center hover:bg-black hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} />
                DISCORD
              </a>
            </div>

            <div className="mb-4">
              <span className="text-sm md:text-base font-mono">CONTACT</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://instagram.com/ethra.world" target="_blank" rel="noopener noreferrer" className="hover:bg-black hover:text-white transition-colors duration-300 p-1" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="mailto:ethra.here@gmail.com" className="hover:bg-black hover:text-white transition-colors duration-300 p-1" aria-label="Email">
                <Mail size={20} />
              </a>
              <Link to="/admin" className="text-xs font-mono text-gray-400 hover:text-black transition-colors ml-auto" title="Admin">
                •
              </Link>
            </div>
          </footer>
        </aside>

        {/* Right Content Area */}
        <main className="w-full lg:w-[70%] p-4 md:p-8 lg:p-16 lg:flex-shrink-0 flex flex-col overflow-hidden">
          {renderRightPanel()}
        </main>
      </div>
    </div>
  );
};

export default Home;
