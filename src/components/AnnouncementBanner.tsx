import React, { useState, useEffect } from 'react';
import { Flame, Megaphone, Clock, Tag, X, ChevronRight, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore, StoreAnnouncement } from '../contexts/StoreContext';

export function AnnouncementBanner() {
  const navigate = useNavigate();
  const { getActiveFlashSale, getActiveAnnouncements } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [now, setNow] = useState(new Date());

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (dismissed) return null;

  const activeFlashSale = getActiveFlashSale();
  const activeAnnouncements = getActiveAnnouncements();

  // Show active flash sale first, or first active announcement
  const activeItem: StoreAnnouncement | null = activeFlashSale || (activeAnnouncements.length > 0 ? activeAnnouncements[0] : null);

  if (!activeItem) return null;

  // Calculate live countdown for end date
  let countdownStr = '';
  let isExpired = false;

  if (activeItem.endDate) {
    const end = new Date(activeItem.endDate).getTime();
    const diff = end - now.getTime();
    if (diff <= 0) {
      isExpired = true;
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        countdownStr = `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
      } else {
        countdownStr = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
      }
    }
  }

  if (isExpired) return null;

  const isFlashSale = activeItem.type === 'Flash Sale';

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={`relative border-b transition-all ${
      isFlashSale 
        ? 'bg-gradient-to-r from-red-950 via-indigo-950 to-zinc-950 border-red-900/40 text-white' 
        : 'bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-950 border-indigo-900/40 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-3 overflow-hidden text-center sm:text-left">
          {/* Icon Badge */}
          <div className={`flex-shrink-0 p-1.5 rounded-lg border ${
            isFlashSale 
              ? 'bg-red-600/20 text-red-400 border-red-500/30' 
              : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
          }`}>
            {isFlashSale ? <Flame className="w-4 h-4 animate-pulse" /> : <Megaphone className="w-4 h-4" />}
          </div>

          {/* Optional Artwork */}
          {activeItem.artworkUrl && (
            <img 
              src={activeItem.artworkUrl} 
              alt={activeItem.title} 
              className="w-8 h-8 rounded object-cover border border-zinc-700 hidden sm:block shrink-0" 
            />
          )}

          {/* Content */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`font-extrabold uppercase tracking-wide text-xs px-2 py-0.5 rounded-full ${
                isFlashSale ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
              }`}>
                {isFlashSale ? '🔥 FLASH SALE' : 'ANNOUNCEMENT'}
              </span>
              <span className="font-bold text-white truncate">{activeItem.title}</span>
            </div>
            <p className="text-zinc-300 text-xs truncate mt-0.5">{activeItem.message}</p>
          </div>
        </div>

        {/* Action Controls & Countdown */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live Countdown Timer if Flash Sale */}
          {countdownStr && (
            <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-700/60 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ends in: {countdownStr}</span>
            </div>
          )}

          {/* Promo Code Pill */}
          {activeItem.promoCode && (
            <button
              onClick={(e) => handleCopyCode(e, activeItem.promoCode!)}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
              title="Click to copy promo code"
            >
              <Tag className="w-3 h-3 text-indigo-400" />
              <span>CODE: <strong>{activeItem.promoCode}</strong></span>
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            </button>
          )}

          {/* CTA Shop Button */}
          <button
            onClick={() => navigate('/collections')}
            className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer ${
              isFlashSale 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            Shop Beats <ChevronRight className="w-3 h-3" />
          </button>

          {/* Close Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
