import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const Community = () => {
  return (
    <AppLayout sectionLabel="COMMUNITY">
      <div className="p-8 md:p-16">
        <header className="mb-16">
          <h1 className="text-3xl md:text-4xl font-mono tracking-wide mb-4">COMMUNITY</h1>
          <p className="text-sm font-mono text-gray-600 leading-relaxed">
            Collaborative projects that bring artists and communities together.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
          {/* 52 Hands */}
          <Link
            to="/community/52-hands"
            className="group border border-black p-8 hover:bg-black hover:text-white transition-colors duration-300 flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <span className="text-xs font-mono tracking-widest border border-current px-2 py-1">
                UPCOMING
              </span>
              <ArrowRight size={16} className="mt-1 flex-shrink-0" />
            </div>
            <h2 className="text-2xl font-mono tracking-wide mb-4">52 HANDS</h2>
            <p className="text-sm font-mono leading-relaxed text-gray-600 group-hover:text-gray-300 flex-1">
              52 artists. 52 cards. One deck. A collaborative art project uniting creators from
              around the world through the universal language of a playing card deck.
            </p>
          </Link>

          {/* Create Your NFT */}
          <Link
            to="/community/nft-canvas"
            className="group border border-black p-8 hover:bg-black hover:text-white transition-colors duration-300 flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <span className="text-xs font-mono tracking-widest border border-current px-2 py-1">
                INTERACTIVE
              </span>
              <ArrowRight size={16} className="mt-1 flex-shrink-0" />
            </div>
            <h2 className="text-2xl font-mono tracking-wide mb-4">YOUR CANVAS</h2>
            <p className="text-sm font-mono leading-relaxed text-gray-600 group-hover:text-gray-300 flex-1">
              Take a template. Make it yours. Each visitor creates a unique piece of digital art
              that becomes their own NFT — with shared revenue across the collective.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-gray-400 group-hover:text-gray-400 mb-1">YOUR SHARE</p>
                <p className="text-2xl">50%</p>
              </div>
              <div>
                <p className="text-gray-400 group-hover:text-gray-400 mb-1">COMMUNITY</p>
                <p className="text-2xl">50%</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Community;
