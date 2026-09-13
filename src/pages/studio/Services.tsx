import React, { useState, useMemo } from 'react';
import { useStore, MusicService } from '../../contexts/StoreContext';
import { 
  Headphones, Plus, Search, ExternalLink, Filter, 
  Trash2, Edit3, Tag, Sparkles, Check, X, Mail, ShieldAlert
} from 'lucide-react';

const CATEGORIES: MusicService['category'][] = [
  'Distribution',
  'Mixing & Mastering',
  'Artist Management',
  'Playlist Curators',
  'Music Publishing',
  'Custom Beat Production',
  'Cover Art & Branding',
  'Licensing & Legal',
  'Other'
];

export function Services() {
  const { services, addService, updateService, deleteService } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MusicService | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    category: 'Distribution' as MusicService['category'],
    description: '',
    externalUrl: '',
    contactEmail: '',
    priceModel: 'Subscription' as MusicService['priceModel'],
    priceText: '',
    tag: '',
    featured: false
  });

  // Extract categories that actually have configured services
  const activeCategories = useMemo(() => {
    const set = new Set(services.map(s => s.category));
    return CATEGORIES.filter(cat => set.has(cat));
  }, [services]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      provider: '',
      category: 'Distribution',
      description: '',
      externalUrl: '',
      contactEmail: '',
      priceModel: 'Subscription',
      priceText: '',
      tag: '',
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: MusicService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      provider: service.provider,
      category: service.category,
      description: service.description,
      externalUrl: service.externalUrl,
      contactEmail: service.contactEmail || '',
      priceModel: service.priceModel,
      priceText: service.priceText || '',
      tag: service.tag || '',
      featured: !!service.featured
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.externalUrl) return;

    let formattedUrl = formData.externalUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (editingService) {
      const updated: MusicService = {
        ...editingService,
        name: formData.name,
        provider: formData.provider,
        category: formData.category,
        description: formData.description,
        externalUrl: formattedUrl,
        contactEmail: formData.contactEmail || undefined,
        priceModel: formData.priceModel,
        priceText: formData.priceText || undefined,
        tag: formData.tag || undefined,
        featured: formData.featured
      };
      updateService(updated);
    } else {
      const newService: MusicService = {
        id: `SVC-${Date.now()}`,
        name: formData.name,
        provider: formData.provider || formData.name,
        category: formData.category,
        description: formData.description,
        externalUrl: formattedUrl,
        contactEmail: formData.contactEmail || undefined,
        priceModel: formData.priceModel,
        priceText: formData.priceText || undefined,
        tag: formData.tag || undefined,
        featured: formData.featured,
        createdAt: new Date().toISOString()
      };
      addService(newService);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <Headphones className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Music Services Hub</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Discover and manage industry-leading tools, distributors, mixing engineers, and promotional services.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors text-sm shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Controls Bar: Search + Category Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search services by name, provider, category, or description..."
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

        {/* Category Filter Pills (Only showing categories that contain actual configured services) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-gray-400 flex items-center gap-1.5 mr-1 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-red-600 text-white'
                : 'bg-[#121721] text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            All Services ({services.length})
          </button>
          {activeCategories.map(cat => {
            const count = services.filter(s => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white'
                    : 'bg-[#121721] text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map(service => (
            <div
              key={service.id}
              className={`bg-[#121721] border rounded-xl p-5 flex flex-col justify-between transition-all hover:border-white/20 relative ${
                service.featured ? 'border-red-500/40 bg-gradient-to-b from-[#161c29] to-[#121721]' : 'border-white/10'
              }`}
            >
              <div>
                {/* Card Top: Badges & Actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/5 border border-white/10 text-gray-300">
                      {service.category}
                    </span>
                    {service.tag && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {service.tag}
                      </span>
                    )}
                    {service.featured && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Admin Edit / Delete buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(service)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      title="Edit Service"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(service.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Provider */}
                <h3 className="text-lg font-bold text-white tracking-tight">{service.name}</h3>
                <p className="text-xs text-gray-400 mb-3 font-medium">By {service.provider}</p>

                {/* Description */}
                <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between text-xs text-gray-400 py-3 border-t border-white/5 mb-4">
                  <span>Model: <strong className="text-gray-200">{service.priceModel}</strong></span>
                  {service.priceText && (
                    <span className="text-red-400 font-semibold">{service.priceText}</span>
                  )}
                </div>

                {/* External Action Button */}
                <a
                  href={service.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-all group"
                >
                  <span>Access Service</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              </div>

              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === service.id && (
                <div className="absolute inset-0 bg-[#0B0E14]/95 rounded-xl p-4 flex flex-col items-center justify-center text-center z-10 space-y-3 border border-red-500/30">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-white font-semibold text-sm">Remove this service?</p>
                    <p className="text-xs text-gray-400 mt-0.5">"{service.name}" will be deleted from catalog.</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
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
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">No services found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? `No service matches "${searchQuery}". Try a different search term or category.`
                : `There are no active services in the selected category.`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(selectedCategory !== 'All' || searchQuery !== '') && (
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg"
            >
              Add New Service
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121721] border border-white/10 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingService ? 'Edit Music Service' : 'Add Music Service'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DistroKid, LANDR Studio, SubmitHub"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Provider / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DistroKid Inc."
                    value={formData.provider}
                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as MusicService['category'] })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the music service, features, and target user..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    External Signup / Website URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://distrokid.com"
                    value={formData.externalUrl}
                    onChange={e => setFormData({ ...formData, externalUrl: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Contact Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="support@service.com"
                    value={formData.contactEmail}
                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Price Model
                  </label>
                  <select
                    value={formData.priceModel}
                    onChange={e => setFormData({ ...formData, priceModel: e.target.value as MusicService['priceModel'] })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Subscription">Subscription</option>
                    <option value="One-Time Fee">One-Time Fee</option>
                    <option value="Custom Quote">Custom Quote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Price Detail Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $22.99/yr, From $15"
                    value={formData.priceText}
                    onChange={e => setFormData({ ...formData, priceText: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Recommended, Essential, Popular"
                    value={formData.tag}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-white font-medium select-none">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 text-red-600 focus:ring-0 bg-[#0B0E14]"
                    />
                    <span>Highlight as Featured</span>
                  </label>
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
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
