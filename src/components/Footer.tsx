import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Shield, Cookie, FileText, Mail, Sparkles, Heart, Bell, BellOff, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

export function Footer() {
  const { 
    subscribeNewsletter, 
    isPushSubscribed, 
    subscribePushNotification, 
    unsubscribePushNotification 
  } = useStore();

  const [emailInput, setEmailInput] = useState('');
  const [consentChecked, setConsentChecked] = useState(true);
  const [newsletterMsg, setNewsletterMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [isPushLoading, setIsPushLoading] = useState(false);

  const openCookieModal = () => {
    window.dispatchEvent(new Event('openCookieSettings'));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterMsg(null);
    if (!emailInput.trim()) return;

    if (!consentChecked) {
      setNewsletterMsg({ success: false, text: 'Please check the consent box to subscribe.' });
      return;
    }

    const res = await subscribeNewsletter(emailInput, consentChecked);
    setNewsletterMsg({ success: res.success, text: res.message });
    if (res.success) {
      setEmailInput('');
    }
  };

  const handleTogglePush = async () => {
    setIsPushLoading(true);
    setPushMsg(null);
    if (isPushSubscribed) {
      unsubscribePushNotification();
      setPushMsg('Opted out of push alerts');
    } else {
      const res = await subscribePushNotification();
      setPushMsg(res.message);
    }
    setIsPushLoading(false);
  };

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950/90 pt-12 pb-28 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Newsletter & Push Alerts Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" /> VIP Beat Drops & Discounts
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Join the NightRunna Email & Push List
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Subscribe to get instant notifications on exclusive beat releases, limited beat pack discounts, and studio announcements.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col space-y-3 min-w-[280px] sm:min-w-[340px]">
            {/* Email Form */}
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                Subscribe
              </button>
            </form>

            <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-indigo-600"
                />
                <span>I agree to receive store updates. Unsubscribe anytime.</span>
              </label>

              {/* Push Opt-In Toggle */}
              <button
                type="button"
                onClick={handleTogglePush}
                disabled={isPushLoading}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  isPushSubscribed 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                {isPushSubscribed ? <Bell className="w-3 h-3 text-emerald-400" /> : <BellOff className="w-3 h-3 text-zinc-400" />}
                <span>{isPushSubscribed ? 'Alerts ON' : 'Enable Push'}</span>
              </button>
            </div>

            {newsletterMsg && (
              <p className={`text-xs font-medium mt-1 ${newsletterMsg.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {newsletterMsg.text}
              </p>
            )}
            {pushMsg && (
              <p className="text-[11px] text-indigo-300 font-medium">
                {pushMsg}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center">
                <Headphones className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">NightRunna</span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Premium instrumentals, sound design, and custom music production. Elevate your sound with authentic sound architecture.
            </p>
            <div className="text-xs text-zinc-600">
              © {new Date().getFullYear()} NightRunna. All rights reserved.
            </div>
          </div>

          {/* Navigation Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Store & Catalog</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/collections" className="hover:text-white transition-colors">Collections</Link></li>
              <li><Link to="/beats" className="hover:text-white transition-colors">Beats Catalog</Link></li>
              <li><Link to="/beat-packs" className="hover:text-white transition-colors">Beat Packs</Link></li>
              <li><Link to="/hall-of-fame" className="hover:text-amber-400 font-semibold transition-colors flex items-center gap-1"><span>Hall of Fame</span> <span className="text-[10px] px-1 bg-amber-500/20 text-amber-400 rounded">Award</span></Link></li>
              <li><Link to="/videos" className="hover:text-white transition-colors">Studio Videos</Link></li>
              <li><Link to="/photos" className="hover:text-white transition-colors">Photos Gallery</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors text-indigo-400">Producer Profile</Link></li>
            </ul>
          </div>

          {/* Custom Beat & Licensing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Production & Rights</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/licenses" className="hover:text-white transition-colors">Licenses & Terms</Link></li>
              <li><Link to="/audio-player" className="hover:text-white transition-colors">Audio Player</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Custom Production Inquiry</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/studio" className="hover:text-white transition-colors text-zinc-500">Studio Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Information</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link to="/copyright" className="hover:text-white transition-colors">Copyright & DMCA</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li>
                <button 
                  onClick={openCookieModal} 
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-xs flex items-center gap-1.5 pt-1"
                >
                  <Cookie className="h-3.5 w-3.5" /> Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>NightRunna Beat Marketplace & Production Suite.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/copyright" className="hover:underline">DMCA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
