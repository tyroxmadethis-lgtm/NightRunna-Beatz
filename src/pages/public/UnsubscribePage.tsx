import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

export function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const { unsubscribeNewsletter } = useStore();
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await unsubscribeNewsletter(email);
      setStatus('success');
      setMsg(`You (${email}) have been unsubscribed from the NightRunna mailing list.`);
    } catch (err) {
      setStatus('error');
      setMsg('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
        <div className="mx-auto w-12 h-12 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Unsubscribe from NightRunna</h1>
          <p className="text-xs text-zinc-400 mt-1">We're sorry to see you go. Enter your email address to opt out of email updates.</p>
        </div>

        {status === 'success' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl space-y-3">
            <CheckCircle className="w-6 h-6 mx-auto" />
            <p className="text-sm font-medium">{msg}</p>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline pt-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Storefront
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div>
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" /> {msg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              Confirm Unsubscribe
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
