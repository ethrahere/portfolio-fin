import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { submitCollaborationRequest } from '../lib/supabase';

// ── Replace this with your actual Discord server invite link ──────────────────
const DISCORD_INVITE_URL = 'https://discord.gg/5kDsbhbF';
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_TYPES = ['3D', 'APPS', 'MUSIC', 'ESSAYS', 'OTHER'];

const Collaborate = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await submitCollaborationRequest(
        name.trim(),
        email.trim(),
        message.trim(),
        projectType || undefined
      );
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-black p-8 md:p-16 bg-white/50 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-16"
        >
          <ArrowLeft size={16} />
          BACK
        </Link>

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-3xl md:text-4xl font-mono tracking-wide mb-6">COLLABORATE</h1>
          <p className="text-sm font-mono text-gray-600 leading-relaxed max-w-xl">
            I'M OPEN TO WORKING WITH ARTISTS, DEVELOPERS, MUSICIANS, AND CURIOUS MINDS. IF YOU HAVE AN IDEA
            OR WANT TO BUILD SOMETHING TOGETHER, GET IN TOUCH.
          </p>
        </header>

        {/* Discord CTA */}
        <div className="border border-black p-6 mb-16">
          <h2 className="text-xs font-mono tracking-widest mb-3">JOIN THE COMMUNITY</h2>
          <p className="text-sm font-mono text-gray-600 mb-4 leading-relaxed">
            FOR ONGOING CONVERSATION, FEEDBACK ON WORK-IN-PROGRESS, AND DIRECT CHAT — JOIN MY DISCORD SERVER.
          </p>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-black px-5 py-3 text-sm font-mono tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
          >
            JOIN DISCORD
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Collaboration Form */}
        <div className="border border-black p-6 md:p-10">
          <h2 className="text-xs font-mono tracking-widest mb-8">PITCH AN IDEA</h2>

          {submitted ? (
            <div className="text-sm font-mono">
              <p className="mb-2">YOUR REQUEST HAS BEEN RECEIVED.</p>
              <p className="text-gray-400 text-xs mb-6">I'LL GET BACK TO YOU AT {email.toUpperCase()}.</p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setProjectType('');
                  setMessage('');
                }}
                className="text-xs font-mono underline hover:no-underline"
              >
                SEND ANOTHER REQUEST
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono tracking-widest mb-2 text-gray-600">
                    YOUR NAME <span className="text-black">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={80}
                    className="w-full border border-black px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="NAME"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-widest mb-2 text-gray-600">
                    YOUR EMAIL <span className="text-black">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={120}
                    className="w-full border border-black px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="EMAIL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono tracking-widest mb-2 text-gray-600">
                  AREA OF INTEREST
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProjectType(projectType === type ? '' : type)}
                      className={`text-xs font-mono tracking-widest px-4 py-2 border transition-colors duration-200 ${
                        projectType === type
                          ? 'bg-black text-white border-black'
                          : 'border-black hover:bg-black hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono tracking-widest mb-2 text-gray-600">
                  YOUR MESSAGE <span className="text-black">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={2000}
                  rows={6}
                  className="w-full border border-black px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                  placeholder="DESCRIBE YOUR IDEA, PROJECT, OR HOW YOU'D LIKE TO WORK TOGETHER..."
                />
                <p className="text-xs font-mono text-gray-400 mt-1">{message.length}/2000</p>
              </div>

              {error && (
                <p className="text-xs font-mono text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !name.trim() || !email.trim() || !message.trim()}
                className="border border-black px-8 py-3 text-sm font-mono tracking-widest hover:bg-black hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'SENDING...' : 'SEND REQUEST'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collaborate;
