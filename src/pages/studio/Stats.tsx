import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Calendar, Play, Download, Share2, Eye, 
  ShoppingCart, DollarSign, Music, Package, Sparkles
} from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

type DateFilterOption = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'This Month' | 'Previous Month' | 'All Time';

export function Stats() {
  const { beats, beatPacks, plays, downloads, shares, views, sales } = useStore();
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('All Time');

  // Filter helper based on date option
  const isDateInFilter = (isoString: string, filter: DateFilterOption): boolean => {
    if (filter === 'All Time') return true;
    const date = new Date(isoString);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === 'Today') {
      return date >= startOfToday;
    }
    if (filter === 'Yesterday') {
      const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
      return date >= startOfYesterday && date < startOfToday;
    }
    if (filter === 'Last 7 Days') {
      const start7DaysAgo = new Date(now.getTime() - 7 * 86400000);
      return date >= start7DaysAgo;
    }
    if (filter === 'Last 30 Days') {
      const start30DaysAgo = new Date(now.getTime() - 30 * 86400000);
      return date >= start30DaysAgo;
    }
    if (filter === 'This Month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    }
    if (filter === 'Previous Month') {
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return date >= startOfPrevMonth && date <= endOfPrevMonth;
    }
    return true;
  };

  const filteredPlays = useMemo(() => plays.filter(p => isDateInFilter(p.timestamp, dateFilter)), [plays, dateFilter]);
  const filteredDownloads = useMemo(() => downloads.filter(d => isDateInFilter(d.timestamp, dateFilter)), [downloads, dateFilter]);
  const filteredShares = useMemo(() => shares.filter(s => isDateInFilter(s.timestamp, dateFilter)), [shares, dateFilter]);
  const filteredViews = useMemo(() => views.filter(v => isDateInFilter(v.timestamp, dateFilter)), [views, dateFilter]);
  const filteredSales = useMemo(() => sales.filter(s => isDateInFilter(s.date, dateFilter)), [sales, dateFilter]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.amount, 0);
  const freeDownloadsCount = filteredDownloads.filter(d => d.type === 'Free').length;

  // Content Performance Table
  const contentPerformance = useMemo(() => {
    const map = new Map<string, { id: string; name: string; type: string; plays: number; downloads: number; shares: number; views: number; salesCount: number; revenue: number }>();

    // Seed with all beats & beat packs
    beats.forEach(b => {
      map.set(b.id, {
        id: b.id,
        name: b.title,
        type: 'Single Beat',
        plays: 0,
        downloads: 0,
        shares: 0,
        views: 0,
        salesCount: 0,
        revenue: 0
      });
    });

    beatPacks.forEach(p => {
      map.set(p.packId, {
        id: p.packId,
        name: p.packName,
        type: 'Beat Pack',
        plays: 0,
        downloads: 0,
        shares: 0,
        views: 0,
        salesCount: 0,
        revenue: 0
      });
    });

    // Accumulate filtered events
    filteredPlays.forEach(p => {
      const item = map.get(p.productId);
      if (item) item.plays += 1;
    });

    filteredDownloads.forEach(d => {
      const item = map.get(d.productId);
      if (item) item.downloads += 1;
    });

    filteredShares.forEach(s => {
      const item = map.get(s.productId);
      if (item) item.shares += 1;
    });

    filteredViews.forEach(v => {
      if (v.productId) {
        const item = map.get(v.productId);
        if (item) item.views += 1;
      }
    });

    filteredSales.forEach(s => {
      const item = map.get(s.productId);
      if (item) {
        item.salesCount += 1;
        item.revenue += s.amount;
      }
    });

    return Array.from(map.values());
  }, [beats, beatPacks, filteredPlays, filteredDownloads, filteredShares, filteredViews, filteredSales]);

  // Daily Chart Buckets (Last 7 Days)
  const chartDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayPlays = plays.filter(p => new Date(p.timestamp) >= dayStart && new Date(p.timestamp) <= dayEnd).length;
      const dayDownloads = downloads.filter(p => new Date(p.timestamp) >= dayStart && new Date(p.timestamp) <= dayEnd).length;
      const daySales = sales.filter(s => new Date(s.date) >= dayStart && new Date(s.date) <= dayEnd);
      const dayRevenue = daySales.reduce((sum, s) => sum + s.amount, 0);

      days.push({ label, plays: dayPlays, downloads: dayDownloads, revenue: dayRevenue });
    }
    return days;
  }, [plays, downloads, sales]);

  const maxPlaysInChart = Math.max(...chartDays.map(d => d.plays), 1);
  const maxRevenueInChart = Math.max(...chartDays.map(d => d.revenue), 10);

  return (
    <div className="space-y-8">
      {/* Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Store Analytics & Performance
          </h2>
          <p className="text-sm text-zinc-400">Track real event interactions across your storefront and music catalog.</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-400 text-xs font-medium uppercase">Timeframe:</span>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-sm"
          >
            <option value="Today" className="bg-zinc-900">Today</option>
            <option value="Yesterday" className="bg-zinc-900">Yesterday</option>
            <option value="Last 7 Days" className="bg-zinc-900">Last 7 Days</option>
            <option value="Last 30 Days" className="bg-zinc-900">Last 30 Days</option>
            <option value="This Month" className="bg-zinc-900">This Month</option>
            <option value="Previous Month" className="bg-zinc-900">Previous Month</option>
            <option value="All Time" className="bg-zinc-900">All Time</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-1">Total Plays</p>
          <h3 className="text-xl font-bold text-white flex items-center gap-1">
            <Play className="w-4 h-4 text-indigo-400" /> {filteredPlays.length}
          </h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-1">Downloads</p>
          <h3 className="text-xl font-bold text-white flex items-center gap-1">
            <Download className="w-4 h-4 text-emerald-400" /> {filteredDownloads.length}
          </h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-1">Free Downloads</p>
          <h3 className="text-xl font-bold text-indigo-400">{freeDownloadsCount}</h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-1">Shares</p>
          <h3 className="text-xl font-bold text-white flex items-center gap-1">
            <Share2 className="w-4 h-4 text-purple-400" /> {filteredShares.length}
          </h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-1">Store Views</p>
          <h3 className="text-xl font-bold text-white flex items-center gap-1">
            <Eye className="w-4 h-4 text-amber-400" /> {filteredViews.length}
          </h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-1">Sales</p>
          <h3 className="text-xl font-bold text-white flex items-center gap-1">
            <ShoppingCart className="w-4 h-4 text-emerald-400" /> {filteredSales.length}
          </h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-1">Revenue</p>
          <h3 className="text-xl font-bold text-emerald-400">${totalRevenue.toFixed(2)}</h3>
        </div>
      </div>

      {/* Real-time Event Trends (Bar Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plays Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Play className="w-4 h-4 text-indigo-400" /> Playback Activity (Last 7 Days)
          </h3>
          <div className="h-48 flex items-end justify-between gap-2 pt-6">
            {chartDays.map((day, idx) => {
              const heightPct = Math.max((day.plays / maxPlaysInChart) * 100, 4);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-mono text-zinc-400">{day.plays}</span>
                  <div 
                    style={{ height: `${heightPct}%` }} 
                    className={`w-full max-w-[36px] rounded-t transition-all ${day.plays > 0 ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-zinc-800'}`}
                  />
                  <span className="text-[10px] text-zinc-500 uppercase">{day.label.split(',')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Revenue Growth (Last 7 Days)
          </h3>
          <div className="h-48 flex items-end justify-between gap-2 pt-6">
            {chartDays.map((day, idx) => {
              const heightPct = Math.max((day.revenue / maxRevenueInChart) * 100, 4);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-mono text-zinc-400">${day.revenue.toFixed(0)}</span>
                  <div 
                    style={{ height: `${heightPct}%` }} 
                    className={`w-full max-w-[36px] rounded-t transition-all ${day.revenue > 0 ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-zinc-800'}`}
                  />
                  <span className="text-[10px] text-zinc-500 uppercase">{day.label.split(',')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Performance Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-zinc-100 mb-4">Catalog Content Performance</h3>
        
        {contentPerformance.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-xl p-12 text-center text-zinc-500">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-white mb-1">No Activity Recorded Yet</p>
            <p className="text-sm">Plays, downloads, shares, and purchases will populate here as listeners interact with your catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950/50 text-xs uppercase font-semibold text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Product Title & ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-center">Plays</th>
                  <th className="px-4 py-3 text-center">Downloads</th>
                  <th className="px-4 py-3 text-center">Shares</th>
                  <th className="px-4 py-3 text-center">Sales</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {contentPerformance.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-zinc-200">{item.name}</p>
                      <span className="text-xs font-mono text-zinc-500">{item.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        item.type === 'Single Beat' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-zinc-200">{item.plays}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-zinc-200">{item.downloads}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-zinc-200">{item.shares}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-emerald-400">{item.salesCount}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-400">${item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
