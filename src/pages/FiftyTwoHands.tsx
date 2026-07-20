import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import BackButton from '../components/BackButton';

const TOTAL_SLOTS = 52;
const FILLED_SLOTS = 0; // Will be driven from DB in a future phase

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const CARDS = SUITS.flatMap(suit =>
  RANKS.map(rank => ({ suit, rank, isRed: suit === '♥' || suit === '♦' }))
);

const FiftyTwoHands = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with notification backend
    setSubmitted(true);
  };

  return (
    <AppLayout sectionLabel="52 HANDS">
      <div className="p-8 md:p-16">
        <header className="mb-16">
          <BackButton />
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-mono tracking-wide">52 HANDS</h1>
            <span className="text-xs font-mono tracking-widest border border-black px-2 py-1 flex-shrink-0">
              UPCOMING
            </span>
          </div>
          <p className="text-sm font-mono text-gray-400">2026</p>
        </header>

        {/* Concept */}
        <section className="mb-16 max-w-3xl">
          <div className="border border-black p-8 mb-8">
            <p className="text-base font-mono leading-relaxed mb-6">52 artists. 52 cards. One deck.</p>
            <p className="text-sm font-mono text-gray-600 leading-relaxed mb-4">
              Each card in a standard playing card deck will be reimagined by a different artist.
              From the Ace of Spades to the King of Hearts, every card becomes a unique canvas for
              an individual creative voice — unified into a single, collectible art object.
            </p>
            <p className="text-sm font-mono text-gray-600 leading-relaxed">
              The resulting deck will be produced as a limited physical edition and as a digital
              collection. Artists retain credit on their card and share in proceeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
            <div className="border border-black p-6">
              <p className="text-gray-400 tracking-widest mb-2">FORMAT</p>
              <p>52 unique artworks<br />Standard card dimensions<br />Physical + digital edition</p>
            </div>
            <div className="border border-black p-6">
              <p className="text-gray-400 tracking-widest mb-2">ARTISTS</p>
              <p>Open call<br />One card per artist<br />All styles welcome</p>
            </div>
            <div className="border border-black p-6">
              <p className="text-gray-400 tracking-widest mb-2">TIMELINE</p>
              <p>Artist selection: TBD<br />Production: TBD<br />Release: 2026</p>
            </div>
          </div>
        </section>

        {/* Artist slots progress */}
        <section className="mb-16">
          <h2 className="text-xs font-mono tracking-widest text-gray-400 mb-6">ARTIST SLOTS</h2>

          <div className="border border-black p-6 mb-8 max-w-xs">
            <div className="flex items-end gap-3 mb-4">
              <span className="text-5xl font-mono">{FILLED_SLOTS}</span>
              <span className="text-3xl font-mono text-gray-300 pb-1">/ {TOTAL_SLOTS}</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 border border-gray-200 mb-2">
              <div
                className="h-full bg-black transition-all duration-700"
                style={{ width: `${(FILLED_SLOTS / TOTAL_SLOTS) * 100}%` }}
              />
            </div>
            <p className="text-xs font-mono text-gray-400 tracking-widest">SLOTS FILLED</p>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-1.5 max-w-2xl">
            {CARDS.map((card, i) => (
              <div
                key={i}
                title={`${card.rank}${card.suit}`}
                className={`aspect-[2/3] border text-[8px] font-mono flex flex-col items-center justify-center gap-0.5 select-none ${
                  i < FILLED_SLOTS
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-200 text-gray-200'
                }`}
              >
                <span className={i < FILLED_SLOTS ? '' : card.isRed ? 'text-gray-300' : ''}>
                  {card.suit}
                </span>
                <span>{card.rank}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Notify */}
        <section className="border-t border-black pt-12 max-w-md">
          <h2 className="text-xs font-mono tracking-widest text-gray-400 mb-2">INTERESTED?</h2>
          <p className="text-sm font-mono mb-6">
            Artist applications open soon. Leave your email to be notified.
          </p>
          {submitted ? (
            <div className="border border-black p-6 font-mono text-sm tracking-widest">
              YOU'RE ON THE LIST — WE'LL BE IN TOUCH.
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                required
                className="flex-1 border border-black border-r-0 px-4 py-3 text-sm font-mono placeholder-gray-300 outline-none focus:bg-gray-50"
              />
              <button
                type="submit"
                className="border border-black px-6 py-3 text-xs font-mono tracking-widest bg-black text-white hover:bg-white hover:text-black transition-colors duration-300 whitespace-nowrap"
              >
                NOTIFY ME
              </button>
            </form>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default FiftyTwoHands;
