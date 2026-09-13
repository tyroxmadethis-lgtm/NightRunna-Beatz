import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { 
  ListMusic, Plus, Trash2, Edit2, Play, Check, X, 
  Music, GripVertical, Disc
} from 'lucide-react';

export function Tracklists() {
  const { beats, tracklists, addTracklist, updateTracklist, deleteTracklist } = useStore();
  const { playTrack } = usePlayer();

  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedBeatIds, setSelectedBeatIds] = useState<string[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBeatIds, setEditBeatIds] = useState<string[]>([]);

  const handleCreate = () => {
    if (!newListName.trim()) return;
    addTracklist({
      id: `TL-${Date.now().toString().slice(-6)}`,
      name: newListName,
      beatIds: selectedBeatIds,
      createdAt: new Date().toLocaleDateString()
    });
    setNewListName('');
    setSelectedBeatIds([]);
    setIsCreating(false);
  };

  const startEdit = (tl: any) => {
    setEditingId(tl.id);
    setEditName(tl.name);
    setEditBeatIds([...tl.beatIds]);
  };

  const handleSaveEdit = (tl: any) => {
    updateTracklist({
      ...tl,
      name: editName,
      beatIds: editBeatIds
    });
    setEditingId(null);
  };

  const toggleBeatInNewList = (beatId: string) => {
    if (selectedBeatIds.includes(beatId)) {
      setSelectedBeatIds(prev => prev.filter(id => id !== beatId));
    } else {
      setSelectedBeatIds(prev => [...prev, beatId]);
    }
  };

  const toggleBeatInEditList = (beatId: string) => {
    if (editBeatIds.includes(beatId)) {
      setEditBeatIds(prev => prev.filter(id => id !== beatId));
    } else {
      setEditBeatIds(prev => [...prev, beatId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Tracklists & Playlists
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-mono">
              {tracklists.length} Playlists
            </span>
          </h2>
          <p className="text-sm text-zinc-400">Curate playlists of beats for artists, licensing pitches, or storefront highlights.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="h-4 w-4" /> Create Tracklist
        </button>
      </div>

      {/* Creator Modal */}
      {isCreating && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl">
          <h3 className="text-lg font-bold text-white">Create New Tracklist</h3>
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Tracklist Title</label>
            <input 
              type="text"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="e.g. Hard Trap Beats 2026"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2">Select Beats to Include ({selectedBeatIds.length} selected)</label>
            {beats.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No beats uploaded in catalog yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                {beats.map(beat => {
                  const isSelected = selectedBeatIds.includes(beat.id);
                  return (
                    <div 
                      key={beat.id}
                      onClick={() => toggleBeatInNewList(beat.id)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold truncate">{beat.title}</span>
                      <span className="font-mono text-[10px] text-zinc-500">{beat.id}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-bold hover:bg-zinc-700">
              Cancel
            </button>
            <button onClick={handleCreate} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500">
              Save Tracklist
            </button>
          </div>
        </div>
      )}

      {/* Main Tracklist View */}
      {tracklists.length === 0 ? (
        <div className="border border-zinc-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center mt-8">
          <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <ListMusic className="h-6 w-6 text-zinc-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Tracklists Yet</h3>
          <p className="text-zinc-400 mb-6 max-w-md text-sm">Group your beats into custom playlists to showcase specific genres or moods.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
          >
            Create Tracklist
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tracklists.map(tl => {
            const isEditing = editingId === tl.id;
            const includedBeats = beats.filter(b => (isEditing ? editBeatIds : tl.beatIds).includes(b.id));

            return (
              <div key={tl.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded px-3 py-1 text-white font-bold text-lg"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {tl.name}
                        <span className="text-xs font-mono text-zinc-500 font-normal">({tl.id})</span>
                      </h3>
                    )}
                    <p className="text-xs text-zinc-500 mt-0.5">Created {tl.createdAt} • {includedBeats.length} Tracks</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(tl)} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500" title="Save">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(tl)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTracklist(tl.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-zinc-400 mb-2">Edit Included Beats:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      {beats.map(beat => {
                        const isSel = editBeatIds.includes(beat.id);
                        return (
                          <div 
                            key={beat.id}
                            onClick={() => toggleBeatInEditList(beat.id)}
                            className={`p-2 rounded border text-xs cursor-pointer flex justify-between ${
                              isSel ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <span>{beat.title}</span>
                            <span className="font-mono text-[10px]">{beat.id}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tracklist Beat Rows */}
                <div className="bg-zinc-950 rounded-lg border border-zinc-800/80 divide-y divide-zinc-800/50">
                  {includedBeats.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-500 italic">No beats added to this tracklist yet.</div>
                  ) : (
                    includedBeats.map((beat, idx) => (
                      <div key={beat.id} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-zinc-600 font-bold w-4">{idx + 1}.</span>
                          <button 
                            onClick={() => playTrack({
                              id: beat.id,
                              title: beat.title,
                              producer: 'NightRunna',
                              price: beat.price
                            })}
                            className="p-1.5 bg-zinc-800 hover:bg-indigo-600 text-white rounded"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                          <div>
                            <p className="font-bold text-zinc-200">{beat.title}</p>
                            <span className="text-[10px] text-indigo-400 font-mono">{beat.id}</span>
                          </div>
                        </div>
                        <span className="text-zinc-500">{beat.metadata?.genre || 'Trap'} • ${beat.price || '39.99'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
