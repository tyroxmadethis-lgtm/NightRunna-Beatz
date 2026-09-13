import React, { useState } from 'react';
import { Megaphone, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';

export function CreatePromotion() {
  const navigate = useNavigate();
  const { beats, beatPacks, addPromotion } = useStore();

  const [name, setName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('Storefront');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Scheduled' | 'Active'>('Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let productType: 'Single Beat' | 'Beat Pack' | 'Storefront' = 'Storefront';
    if (selectedProduct.startsWith('NR-BP')) productType = 'Beat Pack';
    else if (selectedProduct.startsWith('NR-')) productType = 'Single Beat';

    addPromotion({
      id: `PROMO-${Date.now().toString().slice(-6)}`,
      name,
      productId: selectedProduct,
      productType,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || 'Ongoing',
      status,
      plays: 0,
      clicks: 0
    });

    navigate('/studio/promote');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link to="/studio/promote" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 w-fit font-medium">
        <ChevronLeft className="h-4 w-4" /> Back to Promotions
      </Link>
      
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          Create Promotion Campaign
        </h2>
        <p className="text-sm text-zinc-400">Launch a real campaign for beats, beat packs, or store features.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 shadow-xl">
        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-1">Campaign Name</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm font-medium" 
            placeholder="e.g. Summer Trap Beat Sale" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-1">Promoted Item</label>
          <select 
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm font-medium"
          >
            <option value="Storefront">Entire Storefront</option>
            <optgroup label="Single Beats">
              {beats.map(b => (
                <option key={b.id} value={b.id}>{b.title} ({b.id})</option>
              ))}
            </optgroup>
            <optgroup label="Beat Packs">
              {beatPacks.map(p => (
                <option key={p.packId} value={p.packId}>{p.packName} ({p.packId})</option>
              ))}
            </optgroup>
          </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-1">Initial Status</label>
          <div className="flex gap-4">
            {(['Active', 'Scheduled', 'Draft'] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input 
                  type="radio" 
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="text-indigo-600 bg-zinc-950 border-zinc-800 focus:ring-0"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
          <Link to="/studio/promote" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors">
            Launch Promotion
          </button>
        </div>
      </form>
    </div>
  );
}
