import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { ShieldCheck, Info, UserCheck, PieChart } from 'lucide-react';

export function CreatorRights() {
  const { beats } = useStore();
  const [selectedBeatId, setSelectedBeatId] = useState<string>(beats[0]?.id || 'NR-1001');

  const selectedBeat = beats.find(b => b.id === selectedBeatId) || beats[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Creator Rights & Ownership Splits
          </h2>
          <p className="text-sm text-zinc-400">Manage producer splits, writer shares, and master rights internally.</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          Internal Management System (Not a PRO or Government Registration)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Beat Select List */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Select Beat</h3>
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

        {/* Rights Detail Card */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedBeat?.title || 'Catalog Item'}</h3>
              <p className="text-xs text-indigo-400 font-mono">Beat ID: {selectedBeat?.id || 'NR-1001'}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
              Rights Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
              <p className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" /> Primary Producer Credit
              </p>
              <p className="text-lg font-bold text-white">{selectedBeat?.metadata?.producer || 'NightRunna'}</p>
              <p className="text-xs text-zinc-500">100% Producer Royalty Share</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
              <p className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" /> Master Ownership Split
              </p>
              <p className="text-lg font-bold text-emerald-400">100% NightRunna Studio</p>
              <p className="text-xs text-zinc-500">Master Rights Retained</p>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <h4 className="text-sm font-bold text-white">Full Rights Chain Mapping</h4>
            <div className="text-xs text-zinc-400 space-y-1.5 font-mono">
              <p><strong>Beat ID:</strong> {selectedBeat?.id || 'NR-1001'}</p>
              <p><strong>Ownership:</strong> 100% Producer Controlled</p>
              <p><strong>Credits:</strong> Produced by {selectedBeat?.metadata?.producer || 'NightRunna'}</p>
              <p><strong>Standard License:</strong> Non-Exclusive MP3 / WAV / Trackout Lease Available</p>
              <p><strong>Exclusive Rights:</strong> Available via Custom Offer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
