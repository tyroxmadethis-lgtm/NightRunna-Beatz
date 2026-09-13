import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { 
  ShoppingBag, TrendingUp, DollarSign, Download, CheckCircle2, 
  Search, ShieldCheck, Tag, ExternalLink
} from 'lucide-react';

export function Sales() {
  const { sales, downloads, paypalEmail } = useStore();
  const [activeTab, setActiveTab] = useState<'All' | 'Paid Purchases' | 'Free Downloads'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const paidSalesCount = sales.length;
  const freeDownloads = downloads.filter(d => d.type === 'Free');

  const filteredSales = sales.filter(s => 
    s.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDownloads = downloads.filter(d =>
    d.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Sales & Orders Log
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
              PayPal Email: {paypalEmail}
            </span>
          </h2>
          <p className="text-sm text-zinc-400">Track paid transactions, license issuances, and free downloads.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search order ID or product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold uppercase text-zinc-400">Total Revenue</p>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-black text-emerald-400">${totalRevenue.toFixed(2)}</h3>
          <p className="text-xs text-zinc-500 mt-1">Direct to {paypalEmail}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold uppercase text-zinc-400">Completed Orders</p>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-3xl font-black text-zinc-100">{paidSalesCount}</h3>
          <p className="text-xs text-zinc-500 mt-1">Paid licenses issued</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold uppercase text-zinc-400">Free Downloads</p>
            <Download className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-3xl font-black text-purple-400">{freeDownloads.length}</h3>
          <p className="text-xs text-zinc-500 mt-1">Lead generation downloads</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 text-sm font-bold">
        <button 
          onClick={() => setActiveTab('All')}
          className={`pb-3 px-4 border-b-2 transition-colors ${activeTab === 'All' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          Paid Purchases ({sales.length})
        </button>
        <button 
          onClick={() => setActiveTab('Free Downloads')}
          className={`pb-3 px-4 border-b-2 transition-colors ${activeTab === 'Free Downloads' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          Free Downloads ({freeDownloads.length})
        </button>
      </div>

      {/* Content Table / Empty State */}
      {activeTab === 'All' && (
        sales.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Sales Yet</h3>
            <p className="text-zinc-400 max-w-md text-sm">0 sales • $0.00 revenue. Completed customer orders will appear here automatically when payments process.</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950/70 text-xs uppercase font-semibold text-zinc-500">
                  <tr>
                    <th className="px-6 py-3.5">Order ID & Date</th>
                    <th className="px-6 py-3.5">Product ID</th>
                    <th className="px-6 py-3.5">License Type</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredSales.map(sale => (
                    <tr key={sale.orderId} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-indigo-400 font-bold">{sale.orderId}</p>
                        <p className="text-xs text-zinc-500">{new Date(sale.date).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{sale.productId}</p>
                        <span className="text-xs text-zinc-500">{sale.productType}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-300">{sale.license}</td>
                      <td className="px-6 py-4 text-zinc-300 text-xs font-mono">{sale.customer}</td>
                      <td className="px-6 py-4 font-bold text-emerald-400 text-base">${sale.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {activeTab === 'Free Downloads' && (
        freeDownloads.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Free Downloads Yet</h3>
            <p className="text-zinc-400 max-w-md text-sm">When customers trigger Free Downloads from the store, their download log will appear here.</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950/70 text-xs uppercase font-semibold text-zinc-500">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Product Title</th>
                    <th className="px-6 py-3.5">Product ID</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5 text-right">Download Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredDownloads.map(dl => (
                    <tr key={dl.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 text-xs text-zinc-400">{new Date(dl.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-white">{dl.productTitle}</td>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-400">{dl.productId}</td>
                      <td className="px-6 py-4 text-xs text-zinc-300">{dl.productType}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                          Free Download
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
