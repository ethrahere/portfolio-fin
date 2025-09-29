import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail } from 'lucide-react';
import { getLatestProjectThumbnails } from '../lib/supabase';

const Home = () => {
  const [thumbnails, setThumbnails] = useState<{ [categorySlug: string]: string }>({});
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const thumbs = await getLatestProjectThumbnails();
        setThumbnails(thumbs);
      } catch (error) {
        console.error('Error fetching thumbnails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnails();
  }, []);

  const CategoryBox = ({ 
    to, 
    categoryName, 
    categorySlug 
  }: { 
    to: string; 
    categoryName: string; 
    categorySlug: string; 
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const thumbnail = thumbnails[categorySlug];

    return (
      <Link 
        to={to}
        className="group block border border-black hover:bg-black hover:text-white transition-colors duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-full flex items-center justify-center relative">
          {/* Category Text */}
          <span 
            className={`text-xl md:text-3xl font-mono tracking-widest transition-opacity duration-300 ${
              isHovered && thumbnail ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {categoryName}
          </span>

          {/* Thumbnail Image or Video */}
          {thumbnail && (
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {thumbnail.includes('.mp4') || thumbnail.includes('.webm') || thumbnail.includes('.mov') || thumbnail.includes('video') ? (
                <video
                  src={thumbnail}
                  className="w-full h-full object-cover group-hover:opacity-90"
                  muted
                  autoPlay
                  loop
                  playsInline
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <img
                  src={thumbnail}
                  alt={`Latest ${categoryName} project`}
                  className="w-full h-full object-cover group-hover:opacity-90"
                />
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen text-black p-8 md:p-16 flex flex-col bg-white/50">
      <div className="max-w-6xl mx-auto flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-mono tracking-wide">
            ETHRA
          </h1>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 flex-1 auto-rows-fr">
          <CategoryBox to="/3d" categoryName="3D" categorySlug="3d" />
          <CategoryBox to="/design" categoryName="DESIGN" categorySlug="design" />
          <CategoryBox to="/music" categoryName="MUSIC" categorySlug="music" />
          <CategoryBox to="/essays" categoryName="ESSAYS" categorySlug="essays" />
        </main>

        {/* Footer */}
        <footer className="border-t border-black pt-8 mt-8">
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
