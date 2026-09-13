import React, { useState } from 'react';
import { useStore, RecordPlaque } from '../../contexts/StoreContext';
import { Award, Plus, Trash2, Edit3, Check, Sparkles, ShieldCheck, Search, Filter, Disc } from 'lucide-react';

export function PlaquesPage() {
  const { plaques, addPlaque, updatePlaque, deletePlaque, beats } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaque, setEditingPlaque] = useState<RecordPlaque | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    beatTitle: '',
    producer: 'NightRunna',
    artistName: '',
    achievement: '500,000 Streams & 50,000 Downloads',
    awardType: 'Gold' as RecordPlaque['awardType'],
    dateAwarded: new Date().toISOString().split('T')[0],
    hallOfFame: true
  });

  const handleOpenAddModal = () => {
    setEditingPlaque(null);
    const randomPlaqueNum = Math.floor(1000000 + Math.random() * 9000000);
    setFormData({
      beatTitle: beats[0]?.title || '',
      producer: 'NightRunna',
      artistName: '',
      achievement: '500,000 Streams & 50,000 Downloads',
      awardType: 'Gold',
      dateAwarded: new Date().toISOString().split('T')[0],
      hallOfFame: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plaque: RecordPlaque) => {
    setEditingPlaque(plaque);
    setFormData({
      beatTitle: plaque.beatTitle,
      producer: plaque.producer || 'NightRunna',
      artistName: plaque.artistName || '',
      achievement: plaque.achievement,
      awardType: plaque.awardType,
      dateAwarded: plaque.dateAwarded,
      hallOfFame: plaque.hallOfFame
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beatTitle) return;

    if (editingPlaque) {
      updatePlaque({
        ...editingPlaque,
        beatTitle: formData.beatTitle,
        producer: formData.producer || 'NightRunna',
        artistName: formData.artistName || undefined,
        achievement: formData.achievement,
        awardType: formData.awardType,
        dateAwarded: formData.dateAwarded,
        hallOfFame: formData.hallOfFame
      });
    } else {
      const plaqueNum = Math.floor(1000000 + Math.random() * 9000000);
      const newPlaque: RecordPlaque = {
        id: `PLQ-${Date.now()}`,
        plaqueId: `PLQ-${plaqueNum}`,
        beatTitle: formData.beatTitle,
        producer: formData.producer || 'NightRunna',
        artistName: formData.artistName || undefined,
        achievement: formData.achievement,
        awardType: formData.awardType,
        dateAwarded: formData.dateAwarded,
        hallOfFame: formData.hallOfFame,
        createdAt: new Date().toISOString()
      };
      addPlaque(newPlaque);
    }
    setIsModalOpen(false);
  };

  const filteredPlaques = plaques.filter(p => 
    searchQuery === '' ||
    p.beatTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.plaqueId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Digital Record Plaques</h1>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Issue certified digital record plaques and manage Hall of Fame awards for qualifying beat releases.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg transition-colors text-sm shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Plaque</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by beat title or plaque ID (e.g. PLQ-1234567)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="text-xs text-zinc-400 font-mono shrink-0">
          Total Issued: <strong className="text-amber-400">{plaques.length}</strong>
        </div>
      </div>

      {/* Plaques List */}
      {filteredPlaques.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaques.map(plaque => (
            <div key={plaque.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                    {plaque.plaqueId}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    plaque.hallOfFame ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {plaque.hallOfFame ? 'Hall of Fame Active' : 'Private Draft'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{plaque.beatTitle}</h3>
                <p className="text-xs text-zinc-400 mt-1">Award: <strong className="text-amber-400">{plaque.awardType} Certification</strong></p>
                <p className="text-xs text-zinc-400 mt-0.5">Achievement: {plaque.achievement}</p>
                <p className="text-xs text-zinc-500 mt-0.5 font-mono">Awarded: {plaque.dateAwarded}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => handleOpenEditModal(plaque)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors text-xs flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => deletePlaque(plaque.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center space-y-3 max-w-md mx-auto my-8">
          <Award className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-white font-bold text-base">No Plaques Issued Yet</h3>
          <p className="text-zinc-400 text-sm">Issue digital record plaques for qualifying sales or certified milestone releases.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold rounded-lg text-sm"
          >
            Issue Plaque
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingPlaque ? 'Edit Digital Record Plaque' : 'Issue New Digital Record Plaque'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Select Beat or Title *</label>
                {beats.length > 0 ? (
                  <select
                    value={formData.beatTitle}
                    onChange={e => setFormData({ ...formData, beatTitle: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                  >
                    {beats.map(b => (
                      <option key={b.id} value={b.title}>{b.title} (ID: {b.id})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Beat Title"
                    value={formData.beatTitle}
                    onChange={e => setFormData({ ...formData, beatTitle: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Producer Credit</label>
                  <input
                    type="text"
                    value={formData.producer}
                    onChange={e => setFormData({ ...formData, producer: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Artist Credit (Optional)</label>
                  <input
                    type="text"
                    placeholder="Featured Artist"
                    value={formData.artistName}
                    onChange={e => setFormData({ ...formData, artistName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Award Certification</label>
                  <select
                    value={formData.awardType}
                    onChange={e => setFormData({ ...formData, awardType: e.target.value as RecordPlaque['awardType'] })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                  >
                    <option value="Gold">Gold Certification</option>
                    <option value="Platinum">Platinum Certification</option>
                    <option value="Multi-Platinum">Multi-Platinum</option>
                    <option value="Diamond">Diamond Certification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Date Awarded</label>
                  <input
                    type="date"
                    value={formData.dateAwarded}
                    onChange={e => setFormData({ ...formData, dateAwarded: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Achievement Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500,000 Streams & 50,000 Downloads"
                  value={formData.achievement}
                  onChange={e => setFormData({ ...formData, achievement: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hallOfFame"
                  checked={formData.hallOfFame}
                  onChange={e => setFormData({ ...formData, hallOfFame: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500"
                />
                <label htmlFor="hallOfFame" className="text-xs text-zinc-300 font-bold">Showcase on Public Hall of Fame Page</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 text-sm font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-950 text-sm font-bold rounded-lg"
                >
                  {editingPlaque ? 'Save Changes' : 'Issue Plaque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
