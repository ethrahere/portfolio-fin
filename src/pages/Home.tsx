import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-24">
          <h1 className="text-2xl md:text-3xl font-mono tracking-wide">
            ETHRA
          </h1>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-32">
          <Link 
            to="/3d" 
            className="group block aspect-square border border-black hover:bg-black hover:text-white transition-colors duration-300"
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-xl md:text-2xl font-mono tracking-widest">
                3D
              </span>
            </div>
          </Link>

          <Link 
            to="/design" 
            className="group block aspect-square border border-black hover:bg-black hover:text-white transition-colors duration-300"
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-xl md:text-2xl font-mono tracking-widest">
                DESIGN
              </span>
            </div>
          </Link>

          <Link 
            to="/music" 
            className="group block aspect-square border border-black hover:bg-black hover:text-white transition-colors duration-300"
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-xl md:text-2xl font-mono tracking-widest">
                MUSIC
              </span>
            </div>
          </Link>

          <Link 
            to="/essays" 
            className="group block aspect-square border border-black hover:bg-black hover:text-white transition-colors duration-300"
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-xl md:text-2xl font-mono tracking-widest">
                ESSAYS
              </span>
            </div>
          </Link>
        </main>

        {/* Footer */}
        <footer className="border-t border-black pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-sm md:text-base font-mono">
                CONTACT
              </span>
              <Link 
                to="/admin"
                className="text-xs font-mono text-gray-400 hover:text-black transition-colors"
                title="Admin"
              >
                •
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="https://instagram.com/ethra.here" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-black hover:text-white transition-colors duration-300 p-1"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://x.com/ethra_here" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-black hover:text-white transition-colors duration-300 p-1"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="mailto:ethra.here@gmail.com"
                className="hover:bg-black hover:text-white transition-colors duration-300 p-1"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
