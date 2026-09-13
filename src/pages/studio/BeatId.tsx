import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { ShieldCheck, Search, Music, Package, Play, Download, DollarSign, Eye } from 'lucide-react';

export function BeatId() {
  const { beats, beatPacks, plays, downloads, sales, views } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const targetId = searchQuery.trim().toUpperCase();

  // Find beat or beat pack by Beat ID
  const matchedBeat = beats.find(b => b.id.toUpperCase() === targetId) || beats[0];
  const matchedPack = beatPacks.find(p => p.packId.toUpperCase() === targetId);

  const activeRecord = matchedPack ? {
    id: matchedPack.packId,
    title: matchedPack.packName,
    type: 'Beat Pack',
    price: matchedPack.price || '59.99',
    details: `${matchedPack.beats.length} beats contained`,
    freeDownload: matchedPack.freeDownloadEnabled
  } : (matchedBeat ? {
    id: matchedBeat.id,
    title: matchedBeat.title,
    type: 'Single Beat',
    price: matchedBeat.price || '39.99',
    details: `${matchedBeat.metadata?.bpm || '140'} BPM • ${matchedBeat.metadata?.key || 'C Minor'} • ${matchedBeat.metadata?.genre || 'Trap'}`,
    freeDownload: matchedBeat.freeDownloadEnabled
  } : null);

  const idPlays = activeRecord ? plays.filter(p => p.productId === activeRecord.id).length : 0;
  const idDownloads = activeRecord ? downloads.filter(d => d.productId === activeRecord.id).length : 0;
  const idSales = activeRecord ? sales.filter(s => s.productId === activeRecord.id) : [];
  const idRevenue = idSales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Beat ID Content System
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-mono">
              Global Lookup
            </span>
          </h2>
          <p className="text-sm text-zinc-400">Search any Beat ID or Pack ID to trace audio assets, pricing, licenses, downloads, and sales.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search Beat ID (e.g. NR-1001 or NR-BP-001)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-80 font-mono"
          />
        </div>
      </div>

      {activeRecord ? (
        <div className="space-y-6">
          {/* Main Record Banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                {activeRecord.type === 'Beat Pack' ? <Package className="w-8 h-8" /> : <Music className="w-8 h-8" />}
              </div>
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                  ID: {activeRecord.id}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">{activeRecord.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{activeRecord.type} • {activeRecord.details}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase font-bold">Base Price</p>
              <p className="text-2xl font-black text-emerald-400">${activeRecord.price}</p>
            </div>
          </div>

          {/* Relationship Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Total Plays</p>
              <p className="text-xl font-bold text-white flex items-center gap-1.5">
                <Play className="w-4 h-4 text-indigo-400" /> {idPlays}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Downloads Logged</p>
              <p className="text-xl font-bold text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" /> {idDownloads}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Sales Count</p>
              <p className="text-xl font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> {idSales.length}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Revenue Generated</p>
              <p className="text-xl font-bold text-emerald-400">${idRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Connected Catalog Records Tree */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h4 className="text-base font-bold text-white">Central Relationship Map for {activeRecord.id}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-1">
                <p className="text-indigo-400 font-bold uppercase">1. Audio & Master Vault</p>
                <p className="text-zinc-300">File: {activeRecord.title}.wav</p>
                <p className="text-zinc-500">Status: Master Uploaded</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-1">
                <p className="text-purple-400 font-bold uppercase">2. Licensing & Contracts</p>
                <p className="text-zinc-300">Default Lease: MP3/WAV/Trackout</p>
                <p className="text-zinc-500">Contract Ready</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-1">
                <p className="text-emerald-400 font-bold uppercase">3. Storefront Delivery</p>
                <p className="text-zinc-300">Active on Collections & Home</p>
                <p className="text-zinc-500">Free Download: {activeRecord.freeDownload ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-800 border-dashed rounded-xl p-12 text-center text-zinc-500">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="font-bold text-white mb-1">Beat ID Not Found</p>
          <p className="text-sm">Enter a valid Beat ID (e.g. NR-1001) to trace its complete relationship tree.</p>
        </div>
      )}
    </div>
  );
}
