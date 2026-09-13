import React from 'react';
import { 
  ArrowUpRight, Play, ShoppingCart, TrendingUp, Users, 
  Download, Eye, Share2, Music, Package, Disc, Plus, Sparkles, Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';

export function Dashboard() {
  const { 
    beats, beatPacks, sales, downloads, plays, 
    shares, views, activityLogs, customers 
  } = useStore();

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalFreeDownloads = downloads.filter(d => d.type === 'Free').length;

  // Derive most played product
  const mostPlayed = React.useMemo(() => {
    if (plays.length === 0) return null;
    const counts: Record<string, number> = {};
    plays.forEach(p => counts[p.productId] = (counts[p.productId] || 0) + 1);
    let topId = '';
    let max = 0;
    Object.entries(counts).forEach(([id, count]) => {
      if (count > max) { max = count; topId = id; }
    });
    const beat = beats.find(b => b.id === topId);
    const pack = beatPacks.find(p => p.packId === topId);
    return {
      id: topId,
      name: beat ? beat.title : (pack ? pack.packName : topId),
      plays: max
    };
  }, [plays, beats, beatPacks]);

  // Derive most downloaded product
  const mostDownloaded = React.useMemo(() => {
    if (downloads.length === 0) return null;
    const counts: Record<string, number> = {};
    downloads.forEach(d => counts[d.productId] = (counts[d.productId] || 0) + 1);
    let topId = '';
    let max = 0;
    Object.entries(counts).forEach(([id, count]) => {
      if (count > max) { max = count; topId = id; }
    });
    const beat = beats.find(b => b.id === topId);
    const pack = beatPacks.find(p => p.packId === topId);
    return {
      id: topId,
      name: beat ? beat.title : (pack ? pack.packName : topId),
      downloads: max
    };
  }, [downloads, beats, beatPacks]);

  const stats = [
    { name: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, label: 'From completed purchases', icon: ShoppingCart },
    { name: 'Total Sales', value: sales.length.toString(), label: 'Paid orders', icon: TrendingUp },
    { name: 'Total Plays', value: plays.length.toString(), label: 'Real playbacks', icon: Play },
    { name: 'Storefront Views', value: views.length.toString(), label: 'Visitor impressions', icon: Eye },
    { name: 'Total Downloads', value: downloads.length.toString(), label: `Paid & Free (${totalFreeDownloads} free)`, icon: Download },
    { name: 'Total Shares', value: shares.length.toString(), label: 'Share clicks', icon: Share2 },
    { name: 'Catalog Beats', value: beats.length.toString(), label: 'Single tracks', icon: Music },
    { name: 'Beat Packs', value: beatPacks.length.toString(), label: 'Grouped bundles', icon: Package },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            NightRunna Control Center
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">Real-time</span>
          </h2>
          <p className="text-zinc-400 text-sm">Real store metrics, live sales tracking, and catalog overview.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/studio/announcements" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 shadow">
            <Flame className="w-4 h-4" /> Create Flash Sale
          </Link>
          <Link to="/" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors">
            View Storefront
          </Link>
          <Link to="/collections" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            View Collections
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{stat.name}</p>
                <div className="p-2 bg-zinc-800/80 rounded-lg text-indigo-400">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-zinc-100 tracking-tight mb-1">{stat.value}</h3>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Highlight Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Most Played Item</p>
          {mostPlayed ? (
            <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <div>
                <p className="font-bold text-white text-sm">{mostPlayed.name}</p>
                <p className="text-xs text-zinc-500 font-mono">ID: {mostPlayed.id}</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">{mostPlayed.plays} Plays</span>
            </div>
          ) : (
            <div className="text-sm text-zinc-500 italic bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
              No plays recorded yet. Playback activity will appear here.
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Most Downloaded Item</p>
          {mostDownloaded ? (
            <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <div>
                <p className="font-bold text-white text-sm">{mostDownloaded.name}</p>
                <p className="text-xs text-zinc-500 font-mono">ID: {mostDownloaded.id}</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">{mostDownloaded.downloads} Downloads</span>
            </div>
          ) : (
            <div className="text-sm text-zinc-500 italic bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
              No downloads recorded yet. Paid and free downloads will appear here.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              Recent Studio Activity
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{activityLogs.length} events</span>
            </h3>
            <Link to="/studio/stats" className="text-sm text-indigo-400 hover:text-indigo-300">View Analytics</Link>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                <Disc className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No recent activity yet.
                <p className="text-xs text-zinc-600 mt-1">Plays, free downloads, purchases, and uploads will be logged here automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800 max-h-96 overflow-y-auto">
                {activityLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                        {log.type.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{log.description}</p>
                        <span className="text-xs text-zinc-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full shrink-0">
                      {log.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-950/60 to-zinc-900 border border-indigo-900/40 rounded-xl p-6">
            <h3 className="text-base font-bold text-zinc-100 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Catalog Pro Tip
            </h3>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              Ensure your beats have tags, BPM, and Keys configured. Beats with clear metadata receive 3x more search clicks on the Collections page.
            </p>
            <Link to="/studio/tracks" className="inline-block w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors">
              Manage Beat Catalog
            </Link>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Studio Navigation</h3>
            <div className="space-y-2 text-sm">
              <Link to="/studio/promote" className="flex items-center justify-between p-3 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors">
                <span>Run a Promotion</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </Link>
              <Link to="/studio/tracklists" className="flex items-center justify-between p-3 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors">
                <span>Manage Tracklists</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </Link>
              <Link to="/studio/sales" className="flex items-center justify-between p-3 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors">
                <span>Sales & Revenue Log</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </Link>
              <Link to="/studio/integrations" className="flex items-center justify-between p-3 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors">
                <span>PayPal Integration</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
