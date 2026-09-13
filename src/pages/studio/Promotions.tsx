import React from 'react';
import { Megaphone, Plus, Calendar, Tag, Play, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';

export function Promotions() {
  const { promotions } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Promotions & Campaigns
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-mono">
              {promotions.length} Campaigns
            </span>
          </h2>
          <p className="text-sm text-zinc-400">Launch marketing promotions and track campaign performance.</p>
        </div>
        <Link 
          to="/studio/create-promotion"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="h-4 w-4" /> Create Campaign
        </Link>
      </div>

      {promotions.length === 0 ? (
        <div className="border border-zinc-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center mt-8">
          <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <Megaphone className="h-6 w-6 text-zinc-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Active Promotions</h3>
          <p className="text-zinc-400 mb-6 max-w-md text-sm">Create your first marketing campaign to promote a single beat, beat pack, or storefront highlight.</p>
          <Link 
            to="/studio/create-promotion"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-zinc-100 text-base">{promo.name}</h3>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5">Target: {promo.productId} ({promo.productType})</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  promo.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  promo.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  promo.status === 'Completed' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {promo.status}
                </span>
              </div>

              <div className="text-xs text-zinc-400 space-y-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <strong>Dates:</strong> {promo.startDate || 'Immediate'} → {promo.endDate || 'Ongoing'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-zinc-800">
                <div className="bg-zinc-950 p-2 rounded">
                  <p className="text-zinc-500 text-[10px] uppercase">Plays Logged</p>
                  <p className="font-bold text-white">{promo.plays || 0}</p>
                </div>
                <div className="bg-zinc-950 p-2 rounded">
                  <p className="text-zinc-500 text-[10px] uppercase">Clicks Recorded</p>
                  <p className="font-bold text-white">{promo.clicks || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
