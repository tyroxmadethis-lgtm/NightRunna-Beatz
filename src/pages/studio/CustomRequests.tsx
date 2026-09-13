import React, { useState } from 'react';
import { 
  Sparkles, Mail, Calendar, DollarSign, Tag, CheckCircle2, 
  XCircle, Clock, AlertCircle, Filter, Trash2, Eye, Sliders, ChevronDown,
  RefreshCw, Send
} from 'lucide-react';
import { useStore, CustomBeatRequest } from '../../contexts/StoreContext';

const STATUS_COLORS: Record<CustomBeatRequest['status'], { bg: string; text: string; border: string }> = {
  New: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  Reviewing: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Accepted: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'In Progress': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  Completed: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Declined: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  Archived: { bg: 'bg-zinc-800', text: 'text-zinc-400', border: 'border-zinc-700' }
};

export function CustomRequests() {
  const { customRequests, retryCustomRequestEmail, updateCustomRequestStatus, deleteCustomRequest } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedReq, setSelectedReq] = useState<CustomBeatRequest | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const filteredRequests = React.useMemo(() => {
    if (statusFilter === 'All') return customRequests;
    return customRequests.filter(r => r.status === statusFilter);
  }, [customRequests, statusFilter]);

  const handleRetryEmail = async (id: string) => {
    setRetryingId(id);
    await retryCustomRequestEmail(id);
    setRetryingId(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" /> Custom Beat Requests
          </h1>
          <p className="text-zinc-400 text-sm">
            Manage incoming artist beat requests, review budget specifications, and track production status.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs font-medium">
          <span className="text-zinc-400 px-3 py-1">Total: <span className="text-white font-bold">{customRequests.length}</span></span>
          <span className="text-indigo-400 px-3 py-1 bg-indigo-500/10 rounded-lg">New: <span className="font-bold">{customRequests.filter(r => r.status === 'New').length}</span></span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
        {['All', 'New', 'Reviewing', 'Accepted', 'In Progress', 'Completed', 'Declined', 'Archived'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[38px] ${
              statusFilter === status
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {status} ({status === 'All' ? customRequests.length : customRequests.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {/* Requests Table / Cards */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3">
          <Sparkles className="h-10 w-10 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Custom Beat Requests Found</h3>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            {statusFilter === 'All'
              ? 'When visitors request custom beats from the storefront, their submissions will appear here.'
              : `No requests with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const badge = STATUS_COLORS[req.status];
            return (
              <div
                key={req.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        {req.id}
                      </span>
                      <h3 className="font-bold text-white text-base">{req.beatTitleOrConcept}</h3>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                      <span className="font-semibold text-zinc-200">Artist: {req.artistName} ({req.name})</span>
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {req.email}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(req.createdAt).toLocaleDateString()}</span>
                      
                      {/* Email Status Indicator */}
                      <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
                        <span className="text-zinc-500 font-medium">Email:</span>
                        {req.emailStatus === 'Sent' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[11px]">
                            <CheckCircle2 className="h-3 w-3" /> Sent
                          </span>
                        ) : req.emailStatus === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[11px]">
                            <Clock className="h-3 w-3 animate-spin" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full text-[11px]">
                            <AlertCircle className="h-3 w-3" /> Failed
                          </span>
                        )}

                        {req.emailStatus !== 'Sent' && (
                          <button
                            onClick={() => handleRetryEmail(req.id)}
                            disabled={retryingId === req.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-md text-[11px] transition-colors disabled:opacity-50"
                            title="Retry Email Notification"
                          >
                            <RefreshCw className={`h-3 w-3 ${retryingId === req.id ? 'animate-spin' : ''}`} /> Retry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-zinc-800 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-zinc-500 hidden sm:inline">Status:</label>
                      <select
                        value={req.status}
                        onChange={(e) => updateCustomRequestStatus(req.id, e.target.value as CustomBeatRequest['status'])}
                        className="bg-zinc-950 border border-zinc-800 text-white text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[38px]"
                      >
                        <option value="New">New</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Declined">Declined</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setSelectedReq(req)}
                      className="p-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => deleteCustomRequest(req.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Delete Request"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Specs Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Genre / Style</span>
                    <span className="font-medium text-white">{req.genre}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Desired Mood</span>
                    <span className="font-medium text-white">{req.mood}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Target Budget</span>
                    <span className="font-semibold text-emerald-400">{req.budget}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">BPM & Key</span>
                    <span className="font-medium text-white">{req.bpm || 'N/A'} {req.key ? `• ${req.key}` : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-bold">{selectedReq.id}</span>
                <h3 className="text-xl font-bold text-white">{selectedReq.beatTitleOrConcept}</h3>
                <p className="text-xs text-zinc-400">Requested by {selectedReq.artistName} ({selectedReq.name})</p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Email Contact</span>
                  <a href={`mailto:${selectedReq.email}`} className="text-indigo-400 hover:underline font-medium break-all">
                    {selectedReq.email}
                  </a>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Submission Date</span>
                  <span className="text-white font-medium">{new Date(selectedReq.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Estimated Budget</span>
                  <span className="text-emerald-400 font-bold">{selectedReq.budget}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Genre & Mood</span>
                  <span className="text-white font-medium">{selectedReq.genre} ({selectedReq.mood})</span>
                </div>
              </div>

              {/* Email Delivery Log */}
              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 font-semibold block">Email Notification Log</span>
                  <p className="text-[11px] text-zinc-500">
                    Recipient: <span className="text-zinc-300">nightrunna842@gmail.com</span>
                  </p>
                  {selectedReq.emailError && (
                    <p className="text-[11px] text-rose-400 mt-1">{selectedReq.emailError}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedReq.emailStatus === 'Sent' ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Delivered
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRetryEmail(selectedReq.id)}
                      disabled={retryingId === selectedReq.id}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${retryingId === selectedReq.id ? 'animate-spin' : ''}`} />
                      <span>{retryingId === selectedReq.id ? 'Sending...' : 'Retry Email'}</span>
                    </button>
                  )}
                </div>
              </div>

              {selectedReq.referenceArtists && (
                <div>
                  <span className="text-zinc-400 font-semibold block mb-1">Reference Artists / Songs</span>
                  <p className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300">
                    {selectedReq.referenceArtists}
                  </p>
                </div>
              )}

              {selectedReq.details && (
                <div>
                  <span className="text-zinc-400 font-semibold block mb-1">Additional Project Details</span>
                  <p className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300 whitespace-pre-wrap">
                    {selectedReq.details}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <a
                href={`mailto:${selectedReq.email}?subject=NightRunna Custom Beat Request ${selectedReq.id}`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 min-h-[42px]"
              >
                <Mail className="h-4 w-4" /> Reply via Email
              </a>
              <button
                onClick={() => setSelectedReq(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl min-h-[42px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
