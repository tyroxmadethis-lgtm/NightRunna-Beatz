import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { 
  Package, Search, Edit2, MoreVertical, Trash2, Play, Pause, 
  Download, ExternalLink, Music, Disc
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function BeatPacks() {
  const { beatPacks, deleteBeatPack, plays, downloads, sales } = useStore();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackForView, setSelectedPackForView] = useState<any | null>(null);

  const filteredPacks = beatPacks.filter(p => 
    p.packName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.packId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Beat Packs Management
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-mono">{beatPacks.length} Packs</span>
          </h2>
          <p className="text-sm text-zinc-400">Manage your uploaded beat bundles, pricing, and track lists.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search packs by name or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
          <Link to="/studio/upload" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2">
            Upload Beat Pack
          </Link>
        </div>
      </div>

      {beatPacks.length === 0 ? (
        <div className="border border-zinc-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-zinc-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Beat Packs Created</h3>
          <p className="text-zinc-400 mb-6 max-w-md">Group multiple beats into bundled Beat Packs using the Upload Center to increase average order size.</p>
          <Link to="/studio/upload" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm">
            Upload Beat Pack
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPacks.map(pack => {
            const packPlays = plays.filter(p => p.productId === pack.packId).length;
            const packDownloads = downloads.filter(d => d.productId === pack.packId).length;
            const packSales = sales.filter(s => s.productId === pack.packId).length;

            return (
              <div key={pack.packId} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors shadow-lg flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video bg-zinc-950 flex flex-col items-center justify-center overflow-hidden border-b border-zinc-800">
                    {pack.coverImage ? (
                      <img src={URL.createObjectURL(pack.coverImage)} alt={pack.packName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-zinc-600">
                        <Package className="h-12 w-12 mb-1" />
                        <span className="text-xs font-mono">{pack.packId}</span>
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-zinc-900/90 backdrop-blur border border-zinc-700 text-indigo-400 font-mono text-xs px-2 py-0.5 rounded font-bold">
                      {pack.packId}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-zinc-100 text-base leading-snug">{pack.packName}</h3>
                        <p className="text-xs text-zinc-500">{pack.beats.length} Beats Included</p>
                      </div>
                      <span className="text-lg font-black text-emerald-400">${pack.price || '59.99'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-center text-xs">
                      <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                        <p className="text-zinc-500 text-[10px] uppercase">Plays</p>
                        <p className="font-bold text-white">{packPlays}</p>
                      </div>
                      <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                        <p className="text-zinc-500 text-[10px] uppercase">Downloads</p>
                        <p className="font-bold text-white">{packDownloads}</p>
                      </div>
                      <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                        <p className="text-zinc-500 text-[10px] uppercase">Sales</p>
                        <p className="font-bold text-emerald-400">{packSales}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <button 
                    onClick={() => setSelectedPackForView(pack)}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Music className="h-3.5 w-3.5" /> View Tracks ({pack.beats.length})
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Delete beat pack "${pack.packName}" (${pack.packId})?`)) {
                        deleteBeatPack(pack.packId);
                      }
                    }}
                    className="p-2 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                    title="Delete Pack"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pack Contents Modal */}
      {selectedPackForView && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedPackForView.packName}</h3>
                <p className="text-xs text-indigo-400 font-mono">ID: {selectedPackForView.packId} • Price: ${selectedPackForView.price}</p>
              </div>
              <button onClick={() => setSelectedPackForView(null)} className="text-zinc-500 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedPackForView.beats.map((b: any, idx: number) => (
                <div key={b.id || idx} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => playTrack({
                        id: b.id,
                        title: b.title,
                        producer: 'NightRunna',
                        price: selectedPackForView.price
                      })}
                      className="p-1.5 bg-zinc-800 hover:bg-indigo-600 text-white rounded-md"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <p className="font-bold text-white">{b.title}</p>
                      <span className="text-xs text-zinc-500 font-mono">{b.id}</span>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">{b.metadata?.genre || 'Trap'}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedPackForView(null)} className="px-5 py-2 bg-zinc-800 text-white rounded-lg text-sm font-bold hover:bg-zinc-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
