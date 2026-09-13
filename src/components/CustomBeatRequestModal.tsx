import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, Music, DollarSign, Clock } from 'lucide-react';
import { useStore, CustomBeatRequest } from '../contexts/StoreContext';

interface CustomBeatRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomBeatRequestModal({ isOpen, onClose }: CustomBeatRequestModalProps) {
  const { addCustomRequest } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    artistName: '',
    beatTitleOrConcept: '',
    genre: 'Synthwave',
    bpm: '',
    key: '',
    mood: 'Dark & Atmospheric',
    referenceArtists: '',
    budget: '$250 - $500',
    details: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedReq, setSubmittedReq] = useState<CustomBeatRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email is required';
    if (!formData.artistName.trim()) errs.artistName = 'Artist name is required';
    if (!formData.beatTitleOrConcept.trim()) errs.beatTitleOrConcept = 'Beat description/title is required';
    if (!formData.genre) errs.genre = 'Genre selection is required';
    if (!formData.budget) errs.budget = 'Budget selection is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const created = await addCustomRequest({
        name: formData.name,
        email: formData.email,
        artistName: formData.artistName,
        beatTitleOrConcept: formData.beatTitleOrConcept,
        genre: formData.genre,
        bpm: formData.bpm || undefined,
        key: formData.key || undefined,
        mood: formData.mood,
        referenceArtists: formData.referenceArtists || undefined,
        budget: formData.budget,
        details: formData.details || undefined
      });
      setIsSubmitting(false);
      setSubmittedReq(created);
    } catch (err) {
      console.error('Failed to submit request:', err);
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedReq(null);
    setFormData({
      name: '',
      email: '',
      artistName: '',
      beatTitleOrConcept: '',
      genre: 'Synthwave',
      bpm: '',
      key: '',
      mood: 'Dark & Atmospheric',
      referenceArtists: '',
      budget: '$250 - $500',
      details: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Custom Beat Request</h2>
              <p className="text-xs text-zinc-400">Collaborate directly with NightRunna for your next release</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submittedReq ? (
          /* Confirmation View */
          <div className="p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Request Submitted Successfully!</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Your custom beat inquiry has been logged securely in NightRunna Studio.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 max-w-md mx-auto text-left space-y-3">
              <div className="flex justify-between items-center text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                <span>Request ID</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">{submittedReq.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span>Artist Name</span>
                <span className="font-semibold text-white">{submittedReq.artistName}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span>Genre & Style</span>
                <span className="font-medium text-zinc-300">{submittedReq.genre}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span>Target Budget</span>
                <span className="font-medium text-emerald-400">{submittedReq.budget}</span>
              </div>
            </div>

            <div className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
              We will review your submission and contact you via <span className="text-zinc-300">{submittedReq.email}</span> regarding availability and custom production steps.
            </div>

            <button
              onClick={handleResetAndClose}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full text-sm transition-colors min-h-[44px]"
            >
              Done & Return to Store
            </button>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Full Name <span className="text-indigo-400">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full px-3.5 py-2.5 bg-zinc-950 border ${errors.name ? 'border-red-500' : 'border-zinc-800'} text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]`}
                />
                {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address <span className="text-indigo-400">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="artist@example.com"
                  className={`w-full px-3.5 py-2.5 bg-zinc-950 border ${errors.email ? 'border-red-500' : 'border-zinc-800'} text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]`}
                />
                {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Artist & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Artist / Group Name <span className="text-indigo-400">*</span></label>
                <input
                  type="text"
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  placeholder="e.g. VEXX"
                  className={`w-full px-3.5 py-2.5 bg-zinc-950 border ${errors.artistName ? 'border-red-500' : 'border-zinc-800'} text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]`}
                />
                {errors.artistName && <p className="text-[11px] text-red-400 mt-1">{errors.artistName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Beat Title / Working Concept <span className="text-indigo-400">*</span></label>
                <input
                  type="text"
                  value={formData.beatTitleOrConcept}
                  onChange={(e) => setFormData({ ...formData, beatTitleOrConcept: e.target.value })}
                  placeholder="e.g. Cyberpunk Drill Anthem"
                  className={`w-full px-3.5 py-2.5 bg-zinc-950 border ${errors.beatTitleOrConcept ? 'border-red-500' : 'border-zinc-800'} text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]`}
                />
                {errors.beatTitleOrConcept && <p className="text-[11px] text-red-400 mt-1">{errors.beatTitleOrConcept}</p>}
              </div>
            </div>

            {/* Musical Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Primary Genre <span className="text-indigo-400">*</span></label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                >
                  <option value="Synthwave">Synthwave</option>
                  <option value="Trap">Trap</option>
                  <option value="Drill">Drill</option>
                  <option value="Cinematic">Cinematic</option>
                  <option value="R&B">R&B</option>
                  <option value="Boom Bap">Boom Bap</option>
                  <option value="Pop">Pop</option>
                  <option value="Electronic">Electronic / Cyberpunk</option>
                  <option value="Other">Other Custom Style</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target BPM <span className="text-zinc-500">(Optional)</span></label>
                <input
                  type="text"
                  value={formData.bpm}
                  onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                  placeholder="e.g. 130 BPM"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Musical Key <span className="text-zinc-500">(Optional)</span></label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g. C Minor"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Mood & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Desired Mood <span className="text-indigo-400">*</span></label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                >
                  <option value="Dark & Atmospheric">Dark & Atmospheric</option>
                  <option value="Energetic & Hype">Energetic & Hype</option>
                  <option value="Melancholic & Emotional">Melancholic & Emotional</option>
                  <option value="Chill & Smooth">Chill & Smooth</option>
                  <option value="Aggressive & Heavy">Aggressive & Heavy</option>
                  <option value="Uplifting & Heroic">Uplifting & Heroic</option>
                  <option value="Hypnotic & Groovy">Hypnotic & Groovy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Estimated Budget <span className="text-indigo-400">*</span></label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                >
                  <option value="$100 - $250">$100 - $250</option>
                  <option value="$250 - $500">$250 - $500</option>
                  <option value="$500 - $1,000">$500 - $1,000</option>
                  <option value="$1,000+">$1,000+ Exclusive Custom</option>
                </select>
              </div>
            </div>

            {/* Reference Artists */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Reference Artists / Songs <span className="text-zinc-500">(Optional)</span></label>
              <input
                type="text"
                value={formData.referenceArtists}
                onChange={(e) => setFormData({ ...formData, referenceArtists: e.target.value })}
                placeholder="e.g. Travis Scott, Kavinsky, The Weeknd, Metro Boomin"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
              />
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Additional Project Details <span className="text-zinc-500">(Optional)</span></label>
              <textarea
                rows={3}
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Describe your vision, arrangement preferences, instruments needed, or timeline requirements..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm rounded-full transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-full transition-colors flex items-center gap-2 min-h-[44px] shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
