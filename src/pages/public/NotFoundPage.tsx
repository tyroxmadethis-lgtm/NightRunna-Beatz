import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Disc, Music, Box, ArrowLeft, Home, Sparkles, Headphones } from 'lucide-react';

interface NotFoundPageProps {
  type?: 'beat' | 'pack' | 'page';
  customMessage?: string;
}

export function NotFoundPage({ type: propType, customMessage }: NotFoundPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determine context type from prop, query parameter, or route
  const resolvedType = propType || searchParams.get('type') || 'page';

  // Customize messaging based on missing content context
  let title = "404 — You took a wrong turn in the NightRunna.";
  let description = "The page or track you are looking for doesn't exist.";
  let primaryButtonText = "Back to Beats";
  let primaryButtonPath = "/collections";

  if (resolvedType === 'beat') {
    title = "404 — Looks like this beat disappeared into the night.";
    description = customMessage || "This beat is no longer available in the catalog.";
    primaryButtonText = "Back to Beats";
    primaryButtonPath = "/collections";
  } else if (resolvedType === 'pack') {
    title = "404 — This pack disappeared into the night.";
    description = customMessage || "This Beat Pack is no longer available.";
    primaryButtonText = "Explore Beat Packs";
    primaryButtonPath = "/collections";
  } else {
    title = "404 — You took a wrong turn in the NightRunna.";
    description = customMessage || "The page you're looking for doesn't exist.";
    primaryButtonText = "Back to Beats";
    primaryButtonPath = "/collections";
  }

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-12 overflow-hidden bg-gradient-to-b from-zinc-950 via-slate-950 to-indigo-950/40 rounded-2xl border border-zinc-800/80 my-4 shadow-2xl">
      {/* Background Starfield & Space Glow Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle nebula glow spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Floating background media fragments */}
        <div className="absolute top-12 left-[10%] opacity-20 animate-pulse hidden sm:block">
          <Music className="w-8 h-8 text-indigo-400 transform -rotate-12" />
        </div>
        <div className="absolute top-1/3 right-[12%] opacity-25 animate-bounce hidden sm:block duration-1000">
          <Disc className="w-10 h-10 text-cyan-400 transform rotate-45" />
        </div>
        <div className="absolute bottom-20 left-[15%] opacity-20 hidden md:block">
          <Box className="w-9 h-9 text-purple-400" />
        </div>

        {/* Ambient Stars */}
        <div className="absolute top-8 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-ping" />
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-40" />
        <div className="absolute bottom-12 right-1/3 w-1 h-1 bg-cyan-200 rounded-full opacity-70" />
      </div>

      {/* Main Original NightRunna Visual Scene */}
      <div className="relative z-10 max-w-md mx-auto mb-8 flex flex-col items-center">
        {/* Original Vector Scene: Listener with Glowing Headphones realizing the beat is gone */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4 flex items-center justify-center">
          {/* Glowing Vinyl / Halo outline behind figure */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-cyan-500/10 animate-spin-slow border border-indigo-500/30 backdrop-blur-sm flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full border border-dashed border-indigo-400/30" />
          </div>

          {/* Original Silhouette SVG Character with Headphones */}
          <svg 
            viewBox="0 0 200 200" 
            className="w-full h-full text-indigo-400 drop-shadow-[0_0_25px_rgba(99,102,241,0.35)]"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Lunar / Night sky backdrop circle */}
            <circle cx="100" cy="100" r="75" fill="url(#nightGlow)" opacity="0.15" />

            {/* Glowing soundwave ripples dispersing into night */}
            <circle cx="100" cy="95" r="85" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" opacity="0.3" />
            <circle cx="100" cy="95" r="65" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

            {/* Headphone Arc */}
            <path 
              d="M 60 95 C 60 55, 140 55, 140 95" 
              stroke="#818cf8" 
              strokeWidth="7" 
              strokeLinecap="round" 
            />

            {/* Left Ear Cup */}
            <rect x="52" y="85" width="16" height="30" rx="8" fill="#6366f1" />
            <rect x="55" y="88" width="10" height="24" rx="5" fill="#a5b4fc" opacity="0.8" />

            {/* Right Ear Cup */}
            <rect x="132" y="85" width="16" height="30" rx="8" fill="#6366f1" />
            <rect x="135" y="88" width="10" height="24" rx="5" fill="#a5b4fc" opacity="0.8" />

            {/* Listener Silhouette Head & Neck */}
            <path 
              d="M 80 125 C 80 100, 120 100, 120 125 C 120 140, 80 140, 80 125 Z" 
              fill="#1e1b4b" 
            />
            {/* Shrug shoulders posture */}
            <path 
              d="M 50 175 Q 75 145 100 145 Q 125 145 150 175 L 160 190 L 40 190 Z" 
              fill="#0f172a" 
            />

            {/* Flying waveform trails leaving the scene */}
            <path d="M 145 75 Q 165 60 180 70" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M 155 90 Q 175 80 190 95" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            <circle cx="182" cy="68" r="2" fill="#c084fc" />
            <circle cx="192" cy="93" r="2" fill="#38bdf8" />

            <defs>
              <radialGradient id="nightGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) scale(75)">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#090d16" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>

          {/* Floating badge */}
          <div className="absolute -bottom-2 bg-zinc-900/90 border border-indigo-500/40 backdrop-blur-md text-indigo-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Beat Disappeared</span>
          </div>
        </div>

        {/* Big Stylized 404 Header */}
        <div className="inline-block px-4 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/50 text-indigo-400 text-xs font-extrabold uppercase tracking-widest mb-3">
          404 Not Found
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2">
          {title}
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-sm leading-relaxed mb-8">
          {description}
        </p>

        {/* Action Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-md">
          <button 
            onClick={() => navigate(primaryButtonPath)}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
          >
            <Music className="w-4 h-4" />
            <span>{primaryButtonText}</span>
          </button>

          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Go Home</span>
          </button>
        </div>
      </div>

      {/* Helpful catalog shortcut chips */}
      <div className="relative z-10 pt-6 border-t border-zinc-800/60 w-full max-w-md flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
        <span className="font-medium text-zinc-400">Quick Links:</span>
        <Link to="/collections" className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors">
          All Collections
        </Link>
        <Link to="/studio" className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors">
          Producer Studio
        </Link>
        <Link to="/contact" className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors">
          Custom Requests
        </Link>
      </div>
    </div>
  );
}
