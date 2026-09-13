import React, { useState } from 'react';
import { useStore, RecordPlaque } from '../../contexts/StoreContext';
import { Award, Disc, Sparkles, ShieldCheck, Calendar, Hash, Music, ExternalLink, Filter } from 'lucide-react';

export function HallOfFamePage() {
  const { plaques } = useStore();
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [activeModalPlaque, setActiveModalPlaque] = useState<RecordPlaque | null>(null);

  // Filter plaques for Hall of Fame
  const visiblePlaques = plaques.filter(p => {
    if (!p.hallOfFame) return false;
    if (selectedTier === 'All') return true;
    return p.awardType === selectedTier;
  });

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-zinc-950 via-slate-950 to-indigo-950/60 border border-zinc-800 p-8 md:p-12 overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Award className="w-4 h-4 text-amber-400" />
            Hall of Fame
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Digital Record Plaques
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Official NightRunna Studio certified awards recognizing milestone stream achievements, sales milestones, and chart releases.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-400/20 to-indigo-500/20 border-2 border-amber-400/40 p-3 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
          <Disc className="w-full h-full text-amber-400 animate-spin-slow" />
        </div>

        {/* Backdrop Ambient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-zinc-400 flex items-center gap-1 font-semibold mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-zinc-500" /> Filter Award:
          </span>
          {['All', 'Gold', 'Platinum', 'Multi-Platinum', 'Diamond'].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedTier === tier
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        <p className="text-xs text-zinc-500 font-mono">
          Total Hall of Fame Awards: <span className="text-amber-400 font-bold">{visiblePlaques.length}</span>
        </p>
      </div>

      {/* Plaques Grid */}
      {visiblePlaques.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visiblePlaques.map(plaque => (
            <PlaqueCard key={plaque.id} plaque={plaque} onClick={() => setActiveModalPlaque(plaque)} />
          ))}
        </div>
      ) : (
        /* Honest Empty State */
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">No Digital Plaques Issued Yet</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Official NightRunna Digital Record Plaques are awarded when beat releases reach certified sales or stream milestones. Check back soon for new Hall of Fame releases!
            </p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeModalPlaque && (
        <PlaqueModal plaque={activeModalPlaque} onClose={() => setActiveModalPlaque(null)} />
      )}
    </div>
  );
}

// Digital Record Plaque Component Card
function PlaqueCard({ plaque, onClick }: { key?: string; plaque: RecordPlaque; onClick: () => void }) {
  const isGold = plaque.awardType === 'Gold';
  const isDiamond = plaque.awardType === 'Diamond';
  const isPlatinum = plaque.awardType === 'Platinum' || plaque.awardType === 'Multi-Platinum';

  const frameBorderClass = isGold 
    ? 'border-amber-400/60 bg-gradient-to-b from-amber-500/10 via-zinc-950 to-amber-950/40 shadow-amber-500/10'
    : isDiamond
    ? 'border-cyan-300/70 bg-gradient-to-b from-cyan-500/10 via-zinc-950 to-slate-950 shadow-cyan-500/10'
    : 'border-slate-300/60 bg-gradient-to-b from-slate-400/10 via-zinc-950 to-slate-900/40 shadow-slate-400/10';

  const textGradient = isGold 
    ? 'from-amber-200 via-amber-400 to-yellow-500'
    : isDiamond
    ? 'from-cyan-100 via-cyan-300 to-blue-400'
    : 'from-slate-100 via-slate-300 to-zinc-400';

  return (
    <div 
      onClick={onClick}
      className={`relative rounded-xl border-2 ${frameBorderClass} p-6 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 shadow-2xl group flex flex-col justify-between overflow-hidden backdrop-blur-md`}
    >
      {/* Plaque Glass Shine Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div>
        {/* Top Header: NightRunna Seal + Plaque ID */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              NR
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">NightRunna</span>
          </div>
          <div className="px-2.5 py-0.5 rounded bg-zinc-900/90 border border-white/10 text-[11px] font-mono font-bold text-amber-400">
            {plaque.plaqueId}
          </div>
        </div>

        {/* Metallic Vinyl Centerpiece */}
        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
          <div className={`w-full h-full rounded-full border-4 ${isGold ? 'border-amber-400/80 bg-zinc-950' : isDiamond ? 'border-cyan-300/80 bg-zinc-950' : 'border-slate-300/80 bg-zinc-950'} flex items-center justify-center shadow-xl relative overflow-hidden`}>
            {/* Record Grooves */}
            <div className="absolute inset-2 rounded-full border border-dashed border-white/20" />
            <div className="absolute inset-5 rounded-full border border-zinc-800" />
            <div className="absolute inset-9 rounded-full border border-dashed border-white/10" />
            
            {/* Center Label */}
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold text-center p-1 shadow-inner z-10">
              OFFICIAL
            </div>
          </div>

          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-pulse" />
        </div>

        {/* Award Details */}
        <div className="text-center space-y-2 mb-4">
          <span className={`inline-block text-xs font-black uppercase tracking-widest bg-gradient-to-r ${textGradient} bg-clip-text text-transparent`}>
            {plaque.awardType} Certified
          </span>
          <h3 className="text-xl font-extrabold text-white tracking-tight line-clamp-1">{plaque.beatTitle}</h3>
          <p className="text-xs text-zinc-400 font-medium">Produced by {plaque.producer || 'NightRunna'}</p>
          {plaque.artistName && (
            <p className="text-xs text-indigo-400 font-semibold">Featured Artist: {plaque.artistName}</p>
          )}
        </div>
      </div>

      {/* Achievement Footer */}
      <div className="border-t border-white/10 pt-4 text-center">
        <p className="text-xs text-zinc-300 font-semibold mb-1">{plaque.achievement}</p>
        <p className="text-[11px] text-zinc-500 font-mono">Certified: {plaque.dateAwarded}</p>
      </div>
    </div>
  );
}

// Plaque Modal
function PlaqueModal({ plaque, onClose }: { plaque: RecordPlaque; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-zinc-950 border-2 border-amber-500/60 rounded-2xl p-8 space-y-6 shadow-2xl text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-900 border border-zinc-800"
        >
          ✕
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" /> Official NightRunna Award
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-white mb-1">{plaque.beatTitle}</h2>
          <p className="text-sm text-amber-400 font-bold">{plaque.awardType} Record Certification</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 text-left space-y-2 text-xs text-zinc-300 font-mono">
          <p><strong>Plaque ID:</strong> <span className="text-amber-400 font-bold">{plaque.plaqueId}</span></p>
          <p><strong>Producer:</strong> {plaque.producer || 'NightRunna'}</p>
          {plaque.artistName && <p><strong>Artist:</strong> {plaque.artistName}</p>}
          <p><strong>Achievement:</strong> {plaque.achievement}</p>
          <p><strong>Date Awarded:</strong> {plaque.dateAwarded}</p>
          <p><strong>Verification:</strong> Certified by NightRunna Studio Master Registry</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold rounded-xl transition-colors text-sm"
        >
          Close Certificate View
        </button>
      </div>
    </div>
  );
}
