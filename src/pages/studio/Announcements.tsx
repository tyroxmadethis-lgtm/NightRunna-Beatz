import React, { useState } from 'react';
import { 
  Flame, Megaphone, Plus, Edit2, Trash2, Eye, Calendar, Clock, Tag, 
  CheckCircle, AlertCircle, X, Shield, Send, Sparkles, Image as ImageIcon, 
  ChevronRight, ArrowUpRight, Copy, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useStore, StoreAnnouncement } from '../../contexts/StoreContext';

export function Announcements() {
  const { 
    announcements, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement,
    sendAdminNotification,
    sendNewsletterBroadcast
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<StoreAnnouncement | null>(null);
  const [editingItem, setEditingItem] = useState<StoreAnnouncement | null>(null);

  // Form State
  const [type, setType] = useState<'Announcement' | 'Flash Sale'>('Flash Sale');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [status, setStatus] = useState<'Draft' | 'Scheduled' | 'Active' | 'Disabled'>('Active');
  const [discountType, setDiscountType] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [includeBeatPacks, setIncludeBeatPacks] = useState(true);
  const [promoCode, setPromoCode] = useState('FLASH50');
  const [sendPushNotification, setSendPushNotification] = useState(false);
  const [sendEmailAnnouncement, setSendEmailAnnouncement] = useState(false);

  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setType('Flash Sale');
    setTitle('🔥 FLASH SALE: 50% OFF ALL BEATS');
    setMessage('Limited time producer discount on all single beats. Use code FLASH50 at checkout.');
    setArtworkUrl('');
    setStartDate(new Date().toISOString().slice(0, 16));
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setStatus('Active');
    setDiscountType('Percentage');
    setDiscountValue(50);
    setIncludeBeatPacks(true);
    setPromoCode('FLASH50');
    setSendPushNotification(false);
    setSendEmailAnnouncement(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: StoreAnnouncement) => {
    setEditingItem(item);
    setType(item.type);
    setTitle(item.title);
    setMessage(item.message);
    setArtworkUrl(item.artworkUrl || '');
    setStartDate(item.startDate || new Date().toISOString().slice(0, 16));
    setEndDate(item.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setStatus(item.status === 'Expired' ? 'Active' : item.status);
    setDiscountType(item.discountType || 'Percentage');
    setDiscountValue(item.discountValue || 50);
    setIncludeBeatPacks(item.includeBeatPacks !== false);
    setPromoCode(item.promoCode || '');
    setSendPushNotification(item.sendPushNotification || false);
    setSendEmailAnnouncement(item.sendEmailAnnouncement || false);
    setIsModalOpen(true);
  };

  const handleToggleActive = (item: StoreAnnouncement) => {
    const newStatus = item.status === 'Active' ? 'Disabled' : 'Active';
    updateAnnouncement({
      ...item,
      status: newStatus
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    // Calculate effective status based on start/end dates
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    let computedStatus: StoreAnnouncement['status'] = status;
    if (status !== 'Disabled' && status !== 'Draft') {
      if (end && now > end) computedStatus = 'Expired';
      else if (start > now) computedStatus = 'Scheduled';
      else computedStatus = 'Active';
    }

    const itemData: StoreAnnouncement = {
      id: editingItem ? editingItem.id : `ANN-${Date.now().toString().slice(-6)}`,
      type,
      title: title.trim(),
      message: message.trim(),
      artworkUrl: artworkUrl.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
      status: computedStatus,
      discountType: type === 'Flash Sale' ? discountType : undefined,
      discountValue: type === 'Flash Sale' ? Number(discountValue) : undefined,
      includeBeatPacks: type === 'Flash Sale' ? includeBeatPacks : undefined,
      promoCode: type === 'Flash Sale' && promoCode.trim() ? promoCode.trim().toUpperCase() : undefined,
      sendPushNotification,
      sendEmailAnnouncement,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
    };

    if (editingItem) {
      updateAnnouncement(itemData);
    } else {
      addAnnouncement(itemData);
    }

    // Process optional store notifications ONLY if explicitly enabled by admin
    let notifLogs: string[] = [];
    if (sendPushNotification) {
      const res = await sendAdminNotification({
        title: itemData.title,
        body: itemData.message,
        category: type === 'Flash Sale' ? 'Discount' : 'Announcement'
      });
      notifLogs.push(`Push notification sent (${res.deliveredCount} subscribers)`);
    }

    if (sendEmailAnnouncement) {
      const res = await sendNewsletterBroadcast(itemData.title, itemData.message);
      notifLogs.push(res.message);
    }

    if (notifLogs.length > 0) {
      setNotificationStatus(notifLogs.join(' | '));
      setTimeout(() => setNotificationStatus(null), 5000);
    }

    setIsModalOpen(false);
  };

  const getComputedItemStatus = (item: StoreAnnouncement): { label: string; bg: string; text: string } => {
    if (item.status === 'Disabled') {
      return { label: 'Disabled', bg: 'bg-zinc-800', text: 'text-zinc-400' };
    }
    if (item.status === 'Draft') {
      return { label: 'Draft', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' };
    }
    const now = new Date();
    const start = new Date(item.startDate);
    const end = item.endDate ? new Date(item.endDate) : null;

    if (end && now > end) {
      return { label: 'Expired', bg: 'bg-red-500/10 border border-red-500/20', text: 'text-red-400' };
    }
    if (start > now) {
      return { label: 'Scheduled', bg: 'bg-blue-500/10 border border-blue-500/20', text: 'text-blue-400' };
    }
    return { label: 'Active', bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400' };
  };

  const calculateActiveDays = (item: StoreAnnouncement) => {
    if (!item.endDate) return 'Ongoing';
    const start = new Date(item.startDate).getTime();
    const end = new Date(item.endDate).getTime();
    const diff = end - start;
    if (isNaN(diff) || diff <= 0) return '0 days';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Megaphone className="w-4 h-4" /> Marketing & Announcements Engine
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Create Announcement / Flash Sale
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage storefront announcement pop-ups, scheduled promo banners, and automated discount flash sales.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Create Announcement / Flash Sale
        </button>
      </div>

      {/* Optional Notification Status Alert */}
      {notificationStatus && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between text-sm text-emerald-400 font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> {notificationStatus}
          </span>
          <button onClick={() => setNotificationStatus(null)} className="text-emerald-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Announcements Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" /> Existing Announcements & Flash Sales
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Total: {announcements.length}</span>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-16 px-4 text-zinc-500 space-y-3">
            <Megaphone className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-base font-bold text-zinc-300">No Announcements Created Yet</p>
            <p className="text-sm max-w-md mx-auto">Launch a flash sale or storefront announcement to boost beat sales and notify your community.</p>
            <button
              onClick={openCreateModal}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-500 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create First Announcement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase tracking-wider font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-6">Announcement / Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Start Date</th>
                  <th className="py-3.5 px-4">End Date</th>
                  <th className="py-3.5 px-4">Active Days</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {announcements.map((item) => {
                  const statusInfo = getComputedItemStatus(item);
                  const isFlash = item.type === 'Flash Sale';

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {item.artworkUrl ? (
                            <img src={item.artworkUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-zinc-700 shrink-0" />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                              isFlash ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                            }`}>
                              {isFlash ? <Flame className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-xs">{item.title}</p>
                            <p className="text-xs text-zinc-500 truncate max-w-xs">{item.message}</p>
                            {item.promoCode && (
                              <span className="inline-block text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded mt-0.5">
                                Code: {item.promoCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isFlash ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {item.type}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-zinc-200">
                        {isFlash ? (
                          item.discountType === 'Percentage' ? `${item.discountValue}% OFF` : `$${item.discountValue} OFF`
                        ) : (
                          <span className="text-zinc-500 font-normal">N/A</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs font-mono text-zinc-400">
                        {new Date(item.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-4 px-4 text-xs font-mono text-zinc-400">
                        {item.endDate 
                          ? new Date(item.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : <span className="text-zinc-500">No Expiration</span>
                        }
                      </td>

                      <td className="py-4 px-4 text-xs font-bold text-zinc-300">
                        {calculateActiveDays(item)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Live Preview Button */}
                          <button
                            onClick={() => setPreviewItem(item)}
                            title="Preview Announcement"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle Active / Disabled */}
                          <button
                            onClick={() => handleToggleActive(item)}
                            title={item.status === 'Active' ? 'Disable Announcement' : 'Activate Announcement'}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              item.status === 'Active' 
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {item.status === 'Active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit Announcement"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${item.title}"?`)) {
                                deleteAnnouncement(item.id);
                              }
                            }}
                            title="Delete Announcement"
                            className="p-2 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ANNOUNCEMENT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${type === 'Flash Sale' ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                  {type === 'Flash Sale' ? <Flame className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingItem ? 'Edit Announcement / Flash Sale' : 'Create New Announcement / Flash Sale'}
                  </h3>
                  <p className="text-xs text-zinc-400">Configure storefront banner visuals, scheduling, and discount parameters.</p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Type Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Campaign Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('Announcement')}
                    className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      type === 'Announcement'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" /> Announcement Banner
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('Flash Sale')}
                    className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      type === 'Flash Sale'
                        ? 'bg-red-600/20 border-red-500 text-red-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-red-400" /> Flash Sale Discount
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    {type === 'Flash Sale' ? 'Sale Title' : 'Announcement Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={type === 'Flash Sale' ? '🔥 FLASH SALE: ALL BEATS 50% OFF' : 'New Beat Pack Just Dropped'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    {type === 'Flash Sale' ? 'Sale Description' : 'Announcement Message'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter details for storefront visitors..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Optional Image / Artwork URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={artworkUrl}
                      onChange={(e) => setArtworkUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                    />
                    {artworkUrl && (
                      <img src={artworkUrl} alt="Preview" className="w-9 h-9 rounded-lg object-cover border border-zinc-700 shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Flash Sale Specific Fields */}
              {type === 'Flash Sale' && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-xs font-extrabold uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> Flash Sale Discount Parameters
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">Discount Mode</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-bold"
                      >
                        <option value="Percentage">Percentage Discount (%)</option>
                        <option value="Fixed">Fixed Amount ($ USD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">
                        {discountType === 'Percentage' ? 'Discount Percentage (%)' : 'Discount Value ($ USD)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={discountType === 'Percentage' ? 100 : 1000}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">Optional Promo Code</label>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="FLASH50"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-mono uppercase"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeBeatPacks}
                          onChange={(e) => setIncludeBeatPacks(e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 rounded"
                        />
                        Include Beat Packs in Discount
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    End Date & Time {type === 'Flash Sale' ? '(Required)' : '(Optional)'}
                  </label>
                  <input
                    type="datetime-local"
                    required={type === 'Flash Sale'}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Status Toggle & Notifications */}
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Publish Status</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-xs font-bold"
                  >
                    <option value="Active">Publish / Active</option>
                    <option value="Scheduled">Schedule for Start Date</option>
                    <option value="Draft">Save as Draft</option>
                    <option value="Disabled">Disable / Hidden</option>
                  </select>
                </div>

                {/* Optional Store Notifications */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-extrabold uppercase text-indigo-400 tracking-wider block mb-1">
                    Optional Store Notifications
                  </span>
                  <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendPushNotification}
                      onChange={(e) => setSendPushNotification(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    Send push notification to app subscribers
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmailAnnouncement}
                      onChange={(e) => setSendEmailAnnouncement(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    Send email announcement to NightRunna mailing list
                  </label>
                  <p className="text-[11px] text-zinc-500 italic mt-1">
                    Note: Notifications will only be dispatched if explicitly checked above.
                  </p>
                </div>
              </div>

              {/* LIVE STOREFRONT PREVIEW BOX */}
              <div className="border-t border-zinc-800 pt-4">
                <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider block mb-2">Live Banner Preview</span>
                <div className={`p-4 rounded-xl border ${
                  type === 'Flash Sale' 
                    ? 'bg-gradient-to-r from-red-950 via-indigo-950 to-zinc-950 border-red-900/40 text-white' 
                    : 'bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-950 border-indigo-900/40 text-white'
                }`}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                        type === 'Flash Sale' ? 'bg-red-600' : 'bg-indigo-600'
                      }`}>
                        {type === 'Flash Sale' ? '🔥 FLASH SALE' : 'ANNOUNCEMENT'}
                      </span>
                      <strong className="text-white">{title || 'Sample Title'}</strong>
                    </div>
                    {type === 'Flash Sale' && (
                      <span className="font-mono text-amber-300 font-bold bg-zinc-900/80 px-2 py-0.5 rounded text-[11px]">
                        Ends in: 06d 23h 59m
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-1">{message || 'Sample announcement text goes here...'}</p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" /> Storefront Preview
              </h3>
              <button onClick={() => setPreviewItem(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-zinc-400 font-mono">Simulated Top Storefront Banner:</span>
              <div className={`p-4 rounded-xl border ${
                previewItem.type === 'Flash Sale' 
                  ? 'bg-gradient-to-r from-red-950 via-indigo-950 to-zinc-950 border-red-900/40 text-white' 
                  : 'bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-950 border-indigo-900/40 text-white'
              }`}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                      previewItem.type === 'Flash Sale' ? 'bg-red-600' : 'bg-indigo-600'
                    }`}>
                      {previewItem.type === 'Flash Sale' ? '🔥 FLASH SALE' : 'ANNOUNCEMENT'}
                    </span>
                    <strong className="text-white">{previewItem.title}</strong>
                  </div>
                  {previewItem.type === 'Flash Sale' && previewItem.endDate && (
                    <span className="font-mono text-amber-300 font-bold bg-zinc-900/80 px-2 py-0.5 rounded text-[11px]">
                      Ends in: Active Countdown
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-300 mt-1">{previewItem.message}</p>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
