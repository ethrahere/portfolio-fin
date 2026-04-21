import React, { useState, useEffect } from 'react';
import { getApprovedComments, submitComment, ProjectComment } from '../lib/supabase';

interface CommentsProps {
  projectId: string;
}

const Comments: React.FC<CommentsProps> = ({ projectId }) => {
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getApprovedComments(projectId);
        setComments(data);
      } catch {
        // silently fail — no comments shown
      } finally {
        setLoadingComments(false);
      }
    };
    load();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await submitComment(projectId, name.trim(), content.trim(), email.trim() || undefined);
      setSubmitted(true);
      setName('');
      setEmail('');
      setContent('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="mt-16 pt-16 border-t border-black">
      <h2 className="text-sm font-mono mb-8 tracking-widest">COMMENTS</h2>

      {/* Existing comments */}
      {loadingComments ? (
        <p className="text-sm font-mono text-gray-400">LOADING...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm font-mono text-gray-400 mb-12">NO COMMENTS YET. BE THE FIRST.</p>
      ) : (
        <div className="space-y-8 mb-12">
          {comments.map((c) => (
            <div key={c.id} className="border-l-2 border-black pl-6">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-sm font-mono font-bold tracking-wide">{c.name.toUpperCase()}</span>
                <span className="text-xs font-mono text-gray-400">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm font-mono leading-relaxed text-gray-800">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      <div className="border border-black p-6">
        <h3 className="text-xs font-mono tracking-widest mb-6">LEAVE A COMMENT</h3>

        {submitted ? (
          <div className="text-sm font-mono text-gray-600">
            <p>YOUR COMMENT HAS BEEN RECEIVED.</p>
            <p className="mt-1 text-xs text-gray-400">IT WILL APPEAR AFTER REVIEW.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs font-mono underline hover:no-underline"
            >
              WRITE ANOTHER
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono tracking-widest mb-1 text-gray-600">
                  NAME <span className="text-black">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                  className="w-full border border-black px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="YOUR NAME"
                />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-widest mb-1 text-gray-600">
                  EMAIL <span className="text-xs text-gray-400">(OPTIONAL, NOT SHOWN)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                  className="w-full border border-black px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="YOUR EMAIL"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono tracking-widest mb-1 text-gray-600">
                COMMENT <span className="text-black">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                maxLength={1000}
                rows={4}
                className="w-full border border-black px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                placeholder="SHARE YOUR THOUGHTS..."
              />
              <p className="text-xs font-mono text-gray-400 mt-1">{content.length}/1000</p>
            </div>

            {error && (
              <p className="text-xs font-mono text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !name.trim() || !content.trim()}
              className="border border-black px-6 py-2 text-sm font-mono tracking-widest hover:bg-black hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'SENDING...' : 'SUBMIT'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Comments;
