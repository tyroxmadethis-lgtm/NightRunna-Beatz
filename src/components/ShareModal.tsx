import React, { useState } from 'react';
import { X, Copy, Check, Share2, Twitter, Facebook, Send, Mail, Code, ExternalLink, Music } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: {
    id: string;
    title: string;
    producer?: string;
    artwork?: string | null;
    tags?: string[];
    genre?: string;
    price?: string;
  } | null;
}

export function ShareModal({ isOpen, onClose, track }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');

  if (!isOpen || !track) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nightrunna.com';
  const shareUrl = `${origin}/audio-player/${track.id}`;
  const producerName = track.producer || 'NightRunna';
  const tagsList = track.tags && track.tags.length > 0 
    ? track.tags 
    : [track.genre || 'trap', 'dark', 'nightrunna'];

  const hashtagsFormatted = tagsList.map(t => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ');
  const shareText = `🔥 Check out "${track.title}" produced by ${producerName} on NightRunna! 🎧 ${hashtagsFormatted}`;

  const embedCode = `<iframe src="${shareUrl}" width="100%" height="160" frameborder="0" allow="autoplay"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(waUrl, '_blank');
  };

  const handleEmailShare = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(`Listen to "${track.title}" by ${producerName}`)}&body=${encodeURIComponent(`${shareText}\n\nListen now: ${shareUrl}`)}`;
    window.location.href = mailto;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-base tracking-wide uppercase">Share Track</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Preview Banner */}
        <div className="p-6 space-y-5">
          <div className="flex gap-4 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl items-center">
            <div className="relative w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center shadow">
              {track.artwork ? (
                <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-8 h-8 text-zinc-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-white text-base truncate">{track.title}</h4>
              <p className="text-xs text-zinc-400 font-medium">By <span className="text-indigo-400 font-bold">{producerName}</span></p>
              
              {/* Tags list */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tagsList.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700/50">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle Tab: Link vs Embed */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                activeTab === 'link' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Direct Link
            </button>
            <button
              onClick={() => setActiveTab('embed')}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                activeTab === 'embed' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Embed Player
            </button>
          </div>

          {activeTab === 'link' ? (
            <div className="space-y-4">
              {/* Copy URL Input Box */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Beat Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                      copiedLink 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                    }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Social Share Buttons Grid */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                  Share On Social
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  <button
                    onClick={handleTwitterShare}
                    className="flex flex-col items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group"
                  >
                    <Twitter className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-zinc-300">X / Twitter</span>
                  </button>

                  <button
                    onClick={handleFacebookShare}
                    className="flex flex-col items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group"
                  >
                    <Facebook className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-zinc-300">Facebook</span>
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="flex flex-col items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group"
                  >
                    <Send className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-zinc-300">WhatsApp</span>
                  </button>

                  <button
                    onClick={handleEmailShare}
                    className="flex flex-col items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group"
                  >
                    <Mail className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-zinc-300">Email</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Embed Player Code Tab */
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>HTML Embed Code</span>
                <span className="text-[10px] text-zinc-500">Copy & Paste to your site</span>
              </label>
              <textarea
                readOnly
                rows={3}
                value={embedCode}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={handleCopyEmbed}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  copiedEmbed 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                }`}
              >
                {copiedEmbed ? <Check className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                {copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-900/50 border-t border-zinc-800/80 text-center">
          <p className="text-[10px] text-zinc-500 font-medium">
            NightRunna Studio • Share beats with full artwork and social metadata
          </p>
        </div>
      </div>
    </div>
  );
}
