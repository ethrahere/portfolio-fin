import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  // Supabase puts the recovery token in the URL hash; it auto-signs in the user
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setStatus('loading');
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => navigate('/admin'), 2000);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
        <div className="max-w-md mx-auto">
          <div className="text-sm font-mono text-gray-500">
            WAITING FOR RESET LINK... if this persists, request a new reset email.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black p-8 md:p-16 bg-white/50">
      <div className="max-w-md mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-mono underline hover:no-underline mb-16"
        >
          <ArrowLeft size={16} />
          ADMIN
        </Link>

        <div className="border border-black p-8">
          <h1 className="text-2xl font-mono mb-8">SET NEW PASSWORD</h1>

          {status === 'success' ? (
            <p className="text-sm font-mono">PASSWORD UPDATED. REDIRECTING...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-black bg-white font-mono text-sm"
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full p-3 border border-black bg-white font-mono text-sm"
                required
              />
              {error && (
                <p className="text-sm font-mono text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-black text-white p-3 font-mono text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'SAVING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
