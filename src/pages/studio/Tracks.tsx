import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { 
  Play, Pause, Edit2, Download, Trash2, Search, Filter, 
  Disc, ExternalLink, Share2, Tag, Check, X, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Tracks() {
  const { beats, deleteBeat, addBeat, plays, downloads, shares, sales } = useStore();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBeatId, setEditingBeatId] = useState<string | null>(null);

  // Form state for editing
  const [editTitle, setEditTitle] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editBpm, setEditBpm] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editFreeDownload, setEditFreeDownload] = useState(false);
  const [editFeatured, setEditFeatured] = useState(false);

  const filteredBeats = beats.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.metadata?.genre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (beat: any) => {
    setEditingBeatId(beat.id);
    setEditTitle(beat.title);
    setEditGenre(beat.metadata?.genre || 'Trap');
    setEditBpm(beat.metadata?.bpm || '140');
    setEditKey(beat.metadata?.key || 'C Minor');
    setEditPrice(beat.price || '39.99');
    setEditFreeDownload(beat.freeDownloadEnabled || false);
    setEditFeatured(beat.featured || false);
  };

  const saveEdit = (beat: any) => {
    const updated = {
      ...beat,
      title: editTitle,
      price: editPrice,
      freeDownloadEnabled: editFreeDownload,
      featured: editFeatured,
      metadata: {
        ...beat.metadata,
        genre: editGenre,
        bpm: editBpm,
        key: editKey
      }
    };
    addBeat(updated);
    setEditingBeatId(null);
  };

  const toggleFeatured = (beat: any) => {
    const updated = {
      ...beat,
      featured: !beat.featured
    };
    addBeat(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            My Beats Catalog
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-mono">{beats.length} Beats</span>
          </h2>
          <p className="text-sm text-zinc-400">Manage uploaded single tracks, pricing, tags, and license availability.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search by title, ID, genre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
          <Link 
            to="/collections" 
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white flex items-center gap-2 text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" /> View Store
          </Link>
        </div>
      </div>

      {beats.length === 0 ? (
        <div className="border border-zinc-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <Disc className="h-6 w-6 text-zinc-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Beats in Catalog</h3>
          <p className="text-zinc-400 mb-6 max-w-md">Upload your first single beat or ZIP package in the Upload Center to start populating your storefront.</p>
          <Link to="/studio/upload" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm">
            Go to Upload Center
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950/70 text-xs uppercase font-semibold text-zinc-500">
                <tr>
                  <th className="px-6 py-3.5">Beat Title & ID</th>
                  <th className="px-6 py-3.5">Genre / BPM / Key</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Free DL</th>
                  <th className="px-6 py-3.5">Featured</th>
                  <th className="px-6 py-3.5 text-center">Plays</th>
                  <th className="px-6 py-3.5 text-center">DLs</th>
                  <th className="px-6 py-3.5 text-center">Sales</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredBeats.map(beat => {
                  const beatPlays = plays.filter(p => p.productId === beat.id).length;
                  const beatDownloads = downloads.filter(d => d.productId === beat.id).length;
                  const beatSales = sales.filter(s => s.productId === beat.id).length;
                  const isEditing = editingBeatId === beat.id;

                  return (
                    <tr key={beat.id} className="hover:bg-zinc-800/50 transition-colors">
                      {/* Beat Title & ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              if (currentTrack?.id === beat.id) {
                                togglePlayPause();
                              } else {
                                playTrack({
                                  id: beat.id,
                                  title: beat.title,
                                  producer: beat.metadata?.producer || 'NightRunna',
                                  price: beat.price
                                });
                              }
                            }}
                            className="h-10 w-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white text-zinc-300 transition-colors shrink-0"
                          >
                            {currentTrack?.id === beat.id && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                          </button>
                          <div>
                            {isEditing ? (
                              <input 
                                type="text"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white text-sm font-bold"
                              />
                            ) : (
                              <p className="font-bold text-zinc-100">{beat.title}</p>
                            )}
                            <span className="text-xs text-indigo-400 font-mono">{beat.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Genre / BPM / Key */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex flex-col gap-1 text-xs">
                            <input 
                              type="text" 
                              placeholder="Genre"
                              value={editGenre} 
                              onChange={e => setEditGenre(e.target.value)}
                              className="bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-white"
                            />
                            <div className="flex gap-1">
                              <input 
                                type="text" 
                                placeholder="BPM"
                                value={editBpm} 
                                onChange={e => setEditBpm(e.target.value)}
                                className="bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-white w-16"
                              />
                              <input 
                                type="text" 
                                placeholder="Key"
                                value={editKey} 
                                onChange={e => setEditKey(e.target.value)}
                                className="bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-white w-20"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-zinc-200">{beat.metadata?.genre || 'Trap'}</span>
                            <p className="text-xs text-zinc-500">
                              {beat.metadata?.bpm ? `${beat.metadata.bpm} BPM` : '140 BPM'} • {beat.metadata?.key || 'C Minor'}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-bold text-zinc-200">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white w-20 text-sm font-bold"
                          />
                        ) : (
                          `$${beat.price || '39.99'}`
                        )}
                      </td>

                      {/* Free DL Toggle */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={editFreeDownload}
                              onChange={e => setEditFreeDownload(e.target.checked)}
                              className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
                            />
                            Enabled
                          </label>
                        ) : (
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                            beat.freeDownloadEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {beat.freeDownloadEnabled ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>

                      {/* Featured Toggle */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={editFeatured}
                              onChange={e => setEditFeatured(e.target.checked)}
                              className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
                            />
                            Featured
                          </label>
                        ) : (
                          <button
                            onClick={() => toggleFeatured(beat)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                              beat.featured
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                            }`}
                            title={beat.featured ? 'Click to un-feature from storefront' : 'Click to feature on storefront homepage'}
                          >
                            <Star className={`h-3.5 w-3.5 ${beat.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                            <span>{beat.featured ? 'Featured' : 'Feature'}</span>
                          </button>
                        )}
                      </td>

                      {/* Real Stats */}
                      <td className="px-6 py-4 text-center font-bold text-zinc-300">{beatPlays}</td>
                      <td className="px-6 py-4 text-center font-bold text-zinc-300">{beatDownloads}</td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-400">{beatSales}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => saveEdit(beat)}
                              className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                              title="Save Changes"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => setEditingBeatId(null)}
                              className="p-1.5 bg-zinc-800 text-zinc-400 rounded hover:text-white"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => startEdit(beat)}
                              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                              title="Edit Beat"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete beat "${beat.title}" (${beat.id})?`)) {
                                  deleteBeat(beat.id);
                                }
                              }}
                              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded"
                              title="Delete Beat"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
