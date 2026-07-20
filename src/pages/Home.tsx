import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Twitter, Mail, ChevronDown, MessageSquare, ShoppingBag } from 'lucide-react';
import VineCursorCanvas from '../components/VineCursorCanvas';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../contexts/CartContext';

const Home = () => {
  const navigate = useNavigate();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const { itemCount, openCart } = useCart();

  // Mobile visitors land on Shop first, matching the site's previous default
  useEffect(() => {
    if (window.innerWidth < 1024) {
      navigate('/shop', { replace: true });
    }
  }, [navigate]);

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

  // Render right panel content
  const renderRightPanel = () => {
    // ── Home view ──────────────────────────────────────────────────────────────
    return (
      <div className="w-full h-full">
        <div className="lg:hidden flex flex-col gap-3 pt-4">
          <p className="text-xs font-mono text-gray-400 tracking-widest mb-2">
            ONE-OF-ONE ART PIECES, DROPPED EVERY FRIDAY.
          </p>
          <Link
            to="/shop"
            className="text-left text-lg font-mono tracking-widest border border-black px-6 py-4 bg-black text-white flex items-center gap-3"
          >
            <ShoppingBag size={18} />
            SHOP
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/${category.slug}`}
              className="text-left text-lg font-mono tracking-widest border border-black px-6 py-4 hover:bg-black hover:text-white transition-colors duration-300"
            >
              {category.name}
            </Link>
          ))}
          <Link
            to="/community"
            className="text-left text-lg font-mono tracking-widest border border-black px-6 py-4 hover:bg-black hover:text-white transition-colors duration-300"
          >
            COMMUNITY
          </Link>
        </div>
        <div className="hidden lg:block w-full h-full">
          <VineCursorCanvas />
        </div>
      </div>
    );
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
                MENU
                <ChevronDown size={14} />
              </button>

              {showCategoryDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-black shadow-lg z-50 min-w-[120px]">
                  <Link
                    to="/shop"
                    onClick={() => setShowCategoryDropdown(false)}
                    className="block w-full text-left px-4 py-2 text-sm font-mono hover:bg-black hover:text-white transition-colors"
                  >
                    SHOP
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/${category.slug}`}
                      onClick={() => setShowCategoryDropdown(false)}
                      className="block w-full text-left px-4 py-2 text-sm font-mono hover:bg-black hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    to="/community"
                    onClick={() => setShowCategoryDropdown(false)}
                    className="block w-full text-left px-4 py-2 text-sm font-mono hover:bg-black hover:text-white transition-colors"
                  >
                    COMMUNITY
                  </Link>
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
              <Link
                to="/shop"
                className="text-left text-xl font-mono tracking-widest border border-black px-6 py-4 transition-colors duration-300 flex items-center gap-3 bg-black text-white hover:bg-gray-800"
              >
                <ShoppingBag size={18} />
                SHOP
                {itemCount > 0 && (
                  <span className="ml-auto bg-white text-black text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/${category.slug}`}
                  className="text-left text-xl font-mono tracking-widest border border-black px-6 py-4 transition-colors duration-300 hover:bg-black hover:text-white"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/community"
                className="text-left text-xl font-mono tracking-widest border border-black px-6 py-4 transition-colors duration-300 hover:bg-black hover:text-white"
              >
                COMMUNITY
              </Link>
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
