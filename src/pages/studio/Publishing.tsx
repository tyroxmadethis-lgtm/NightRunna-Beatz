import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { Globe, ShieldCheck, Search, Info } from 'lucide-react';

export function Publishing() {
  const { beats, sales } = useStore();
  const [selectedBeatId, setSelectedBeatId] = useState<string>(beats[0]?.id || 'NR-1001');

  const selectedBeat = beats.find(b => b.id === selectedBeatId) || beats[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Publishing & PRO Splits
          </h2>
          <p className="text-sm text-zinc-400">Track performance rights organization (BMI / ASCAP) information and publishing catalog records.</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          Internal NightRunna Catalog Note
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Beat Selection */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Catalog Items</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {beats.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No beats uploaded in catalog.</p>
            ) : (
              beats.map(b => (
                <div 
                  key={b.id}
                  onClick={() => setSelectedBeatId(b.id)}
                  className={`p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                    selectedBeatId === b.id ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold">{b.title}</p>
                  <p className="text-xs font-mono text-indigo-400">{b.id}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Publishing Information View */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedBeat?.title || 'Catalog Item'}</h3>
              <p className="text-xs text-indigo-400 font-mono">Beat ID: {selectedBeat?.id || 'NR-1001'}</p>
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
              Publishing Registered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <p className="text-xs text-zinc-500 font-bold uppercase">Performance Rights Org</p>
              <p className="font-bold text-white">BMI / ASCAP (NightRunna Music)</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <p className="text-xs text-zinc-500 font-bold uppercase">Publisher Share</p>
              <p className="font-bold text-emerald-400">50% Writer / 50% Publisher</p>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs text-zinc-400">
            <h4 className="font-bold text-white text-sm">Standard Commercial License Publishing Rights</h4>
            <p>Under standard non-exclusive lease agreements, the licensee is permitted up to 100,000 streams and 1 monetized video. Sync rights for TV/Film require an Exclusive License clearance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
