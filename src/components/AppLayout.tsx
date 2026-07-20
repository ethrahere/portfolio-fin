import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, Mail, ChevronDown, ShoppingBag, MessageSquare } from 'lucide-react';
import CartDrawer from './CartDrawer';
import { useCart } from '../contexts/CartContext';

const DISCORD_URL = 'https://discord.gg/5kDsbhbF';

const NAV_ITEMS = [
  { label: 'SHOP', href: '/shop' },
  { label: '3D', href: '/3d' },
  { label: 'OBJECTS', href: '/objects' },
  { label: 'APPS', href: '/apps' },
  { label: 'MUSIC', href: '/music' },
  { label: 'ESSAYS', href: '/essays' },
  { label: 'RESOURCES', href: '/resources' },
  { label: 'BIO', href: '/bio' },
  { label: 'COMMUNITY', href: '/community' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  /** Label shown in the mobile top-nav breadcrumb. */
  sectionLabel?: string;
}

const AppLayout = ({ children, sectionLabel = 'COMMUNITY' }: AppLayoutProps) => {
  const location = useLocation();
  const { itemCount, openCart } = useCart();
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="h-screen text-black bg-white/50 flex flex-col overflow-hidden">
      <CartDrawer />

      {/* ── Mobile Top Nav ───────────────────────────────────────────────── */}
      <nav className="lg:hidden border-b border-black bg-white flex-shrink-0">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="text-xl font-mono tracking-wide">ETHRA</Link>

          <div className="flex items-center gap-3">
            {/* Nav dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowNavDropdown(v => !v); setShowContactDropdown(false); }}
                className="flex items-center gap-2 text-sm font-mono border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
              >
                {sectionLabel}
                <ChevronDown size={14} />
              </button>
              {showNavDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-black shadow-lg z-50 min-w-[140px]">
                  {NAV_ITEMS.map(item => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setShowNavDropdown(false)}
                      className={`block w-full text-left px-4 py-2 text-sm font-mono hover:bg-black hover:text-white transition-colors ${
                        isActive(item.href) ? 'bg-gray-100' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
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

            {/* Contact dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowContactDropdown(v => !v); setShowNavDropdown(false); }}
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
                    className="flex items-center gap-3 px-4 py-3 text-sm font-mono hover:bg-black hover:text-white transition-colors whitespace-nowrap border-b border-gray-200"
                  >
                    <Instagram size={16} />
                    INSTAGRAM
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
        {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden lg:flex lg:w-[30%] border-r border-black flex-col flex-shrink-0">
          <div className="flex-1 overflow-y-auto p-8 md:p-16">
            <header className="mb-12 flex items-center justify-between">
              <Link to="/" className="text-2xl md:text-3xl font-mono tracking-wide hover:opacity-70 transition-opacity">
                ETHRA
              </Link>
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
            </header>

            <div className="mb-10">
              <p className="text-sm font-mono text-gray-600 leading-relaxed">
                ONE-OF-ONE ART PIECES.
              </p>
            </div>

            <nav className="flex flex-col gap-4">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-left text-xl font-mono tracking-widest border border-black px-6 py-4 transition-colors duration-300 flex items-center gap-3 ${
                    isActive(item.href)
                      ? 'bg-black text-white'
                      : 'hover:bg-black hover:text-white'
                  }`}
                >
                  {item.label === 'SHOP' && <ShoppingBag size={18} />}
                  {item.label}
                  {item.label === 'SHOP' && itemCount > 0 && (
                    <span className="ml-auto bg-white text-black text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
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
              <a
                href="https://instagram.com/ethra.world"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-black hover:text-white transition-colors duration-300 p-1"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:ethra.here@gmail.com"
                className="hover:bg-black hover:text-white transition-colors duration-300 p-1"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
              <Link
                to="/admin"
                className="text-xs font-mono text-gray-400 hover:text-black transition-colors ml-auto"
                title="Admin"
              >
                •
              </Link>
            </div>
          </footer>
        </aside>

        {/* ── Page Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
