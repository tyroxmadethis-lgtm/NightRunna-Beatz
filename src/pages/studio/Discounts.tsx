import React, { useState, useMemo } from 'react';
import { useStore, Discount } from '../../contexts/StoreContext';
import { 
  CreditCard, Plus, Search, Copy, Check, ExternalLink, 
  Trash2, Edit3, Tag, Calendar, ShieldAlert, Sparkles, Filter, Percent, DollarSign, X
} from 'lucide-react';

export function Discounts() {
  const { discounts, addDiscount, updateDiscount, deleteDiscount } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Active' | 'Expired' | 'Partner Deal' | 'Storefront'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'Percentage' as Discount['discountType'],
    discountValue: 20,
    targetType: 'Single Beats' as Discount['targetType'],
    status: 'Active' as Discount['status'],
    expirationDate: '',
    usageLimit: '',
    partnerUrl: ''
  });

  // Filtered Discounts
  const filteredDiscounts = useMemo(() => {
    return discounts.filter(discount => {
      let matchesFilter = true;
      if (selectedFilter === 'Active') matchesFilter = discount.status === 'Active';
      if (selectedFilter === 'Expired') matchesFilter = discount.status === 'Expired';
      if (selectedFilter === 'Partner Deal') matchesFilter = discount.targetType === 'Partner Deal';
      if (selectedFilter === 'Storefront') matchesFilter = discount.targetType !== 'Partner Deal';

      const matchesSearch = searchQuery === '' || 
        discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [discounts, selectedFilter, searchQuery]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'Percentage',
      discountValue: 20,
      targetType: 'Single Beats',
      status: 'Active',
      expirationDate: '',
      usageLimit: '',
      partnerUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      title: discount.title,
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      targetType: discount.targetType,
      status: discount.status,
      expirationDate: discount.expirationDate || '',
      usageLimit: discount.usageLimit ? String(discount.usageLimit) : '',
      partnerUrl: discount.partnerUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) return;

    const formattedCode = formData.code.toUpperCase().replace(/\s+/g, '');

    if (editingDiscount) {
      const updated: Discount = {
        ...editingDiscount,
        code: formattedCode,
        title: formData.title,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        targetType: formData.targetType,
        status: formData.status,
        expirationDate: formData.expirationDate || undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        partnerUrl: formData.targetType === 'Partner Deal' ? (formData.partnerUrl || undefined) : undefined
      };
      updateDiscount(updated);
    } else {
      const newDiscount: Discount = {
        id: `DISC-${Date.now()}`,
        code: formattedCode,
        title: formData.title,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        targetType: formData.targetType,
        status: formData.status,
        expirationDate: formData.expirationDate || undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        usageCount: 0,
        partnerUrl: formData.targetType === 'Partner Deal' ? (formData.partnerUrl || undefined) : undefined,
        createdAt: new Date().toISOString()
      };
      addDiscount(newDiscount);
    }

    setIsModalOpen(false);
  };

  const toggleStatus = (discount: Discount) => {
    const nextStatus = discount.status === 'Active' ? 'Expired' : 'Active';
    updateDiscount({ ...discount, status: nextStatus });
  };

  const handleDelete = (id: string) => {
    deleteDiscount(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Deals & Discounts Hub</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Manage store promo codes, beat discounts, licensing offers, and exclusive music partner deals.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors text-sm shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Discount</span>
        </button>
      </div>

      {/* Controls Bar: Search + Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search promo codes, deals, or descriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#121721] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-gray-400 flex items-center gap-1.5 mr-1 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" /> View:
          </span>
          {[
            { key: 'All', label: `All Offers (${discounts.length})` },
            { key: 'Active', label: 'Active Deals' },
            { key: 'Storefront', label: 'NightRunna Store' },
            { key: 'Partner Deal', label: 'Partner Deals' },
            { key: 'Expired', label: 'Expired' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedFilter === tab.key
                  ? 'bg-red-600 text-white'
                  : 'bg-[#121721] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discounts Grid */}
      {filteredDiscounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDiscounts.map(discount => (
            <div
              key={discount.id}
              className={`bg-[#121721] border rounded-xl p-5 flex flex-col justify-between transition-all hover:border-white/20 relative ${
                discount.status === 'Active' ? 'border-white/10' : 'border-white/5 opacity-75'
              }`}
            >
              <div>
                {/* Top Bar: Code Tag + Status + Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Code Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-mono font-bold text-sm tracking-wider">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{discount.code}</span>
                    </div>

                    {/* Status Pill */}
                    <button
                      onClick={() => toggleStatus(discount)}
                      title="Click to toggle status"
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                        discount.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : discount.status === 'Draft'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                      }`}
                    >
                      {discount.status}
                    </button>
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(discount)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      title="Edit Discount"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(discount.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete Discount"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Target */}
                <div className="space-y-1 mb-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{discount.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-red-400 font-semibold">
                      {discount.discountType === 'Percentage' && `${discount.discountValue}% OFF`}
                      {discount.discountType === 'Fixed Amount' && `$${discount.discountValue} OFF`}
                      {discount.discountType === 'Free Bonus' && `BONUS OFFER`}
                    </span>
                    <span>•</span>
                    <span>Target: <strong className="text-gray-300">{discount.targetType}</strong></span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {discount.description}
                </p>
              </div>

              <div>
                {/* Details Footer */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 py-3 border-t border-white/5 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>Expires: <strong className="text-gray-300">{discount.expirationDate || 'Never'}</strong></span>
                  </div>
                  <div className="text-right">
                    <span>Redemptions: <strong className="text-gray-300">{discount.usageCount}</strong> {discount.usageLimit ? `/ ${discount.usageLimit}` : ''}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(discount.id, discount.code)}
                    className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {copiedCodeId === discount.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-gray-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  {discount.partnerUrl && (
                    <a
                      href={discount.partnerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-sm flex items-center gap-1.5 transition-colors shrink-0 shadow-lg shadow-red-600/20"
                    >
                      <span>Redeem Deal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === discount.id && (
                <div className="absolute inset-0 bg-[#0B0E14]/95 rounded-xl p-4 flex flex-col items-center justify-center text-center z-10 space-y-3 border border-red-500/30">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-white font-semibold text-sm">Delete discount code?</p>
                    <p className="text-xs text-gray-400 mt-0.5">"{discount.code}" will be permanently removed.</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-md"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#121721] border border-white/10 rounded-xl p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">No discount codes found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? `No deal matches "${searchQuery}". Try a different search code.`
                : `There are no active discounts matching the selected filter.`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(selectedFilter !== 'All' || searchQuery !== '') && (
              <button
                onClick={() => { setSelectedFilter('All'); setSearchQuery(''); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg"
            >
              Create New Discount
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121721] border border-white/10 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingDiscount ? 'Edit Discount Code' : 'Create New Discount'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Promo Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER20"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-red-500/50 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Offer Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20% Off All Single Beats"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain terms, eligibility, or partner offer details..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value as Discount['discountType'] })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="Percentage">Percentage Off (%)</option>
                    <option value="Fixed Amount">Fixed Amount Off ($)</option>
                    <option value="Free Bonus">Free Bonus Item</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Discount Value ({formData.discountType === 'Percentage' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Target Application
                  </label>
                  <select
                    value={formData.targetType}
                    onChange={e => setFormData({ ...formData, targetType: e.target.value as Discount['targetType'] })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="Storefront">Entire Storefront</option>
                    <option value="Single Beats">Single Beats</option>
                    <option value="Beat Packs">Beat Packs</option>
                    <option value="Partner Deal">External Partner Deal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as Discount['status'] })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              {formData.targetType === 'Partner Deal' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Partner Deal Link (URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://distrokid.com/vip/nightrunna"
                    value={formData.partnerUrl}
                    onChange={e => setFormData({ ...formData, partnerUrl: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Max Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={formData.usageLimit}
                    onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-red-600/20"
                >
                  {editingDiscount ? 'Save Changes' : 'Create Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
