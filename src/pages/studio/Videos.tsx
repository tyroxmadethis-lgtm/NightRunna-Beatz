import React, { useState, useMemo } from 'react';
import { useStore, VideoRecord } from '../../contexts/StoreContext';
import { 
  Video, Plus, Search, Eye, Edit3, Trash2, Tag, 
  Sparkles, Filter, Play, ArrowUp, ArrowDown, X, ShieldAlert,
  Film, CheckCircle2, Globe, EyeOff, Link2
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Music Videos',
  'Beat Videos',
  'Producer Videos',
  'Tutorials',
  'Behind the Scenes',
  'Interviews',
  'Promotions',
  'Other'
];

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.trim().match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  if (url.trim().length === 11 && !url.includes('/') && !url.includes('.')) {
    return url.trim();
  }
  return null;
}

export function Videos() {
  const { videos, addVideo, updateVideo, deleteVideo, reorderVideos, beats, beatPacks, tracklists, promotions } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Published' | 'Unpublished' | 'Featured'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    title: '',
    description: '',
    category: 'Music Videos',
    customCategory: '',
    tags: '',
    published: true,
    featured: false,
    associatedProductId: '',
    associatedProductType: 'Single Beat' as 'Single Beat' | 'Beat Pack' | 'Tracklist' | 'Promotion'
  });

  const [detectedYtId, setDetectedYtId] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Categories present in actual data or default
  const categoriesList = useMemo(() => {
    const customInUse = videos.map(v => v.category).filter(c => !DEFAULT_CATEGORIES.includes(c));
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...customInUse]));
  }, [videos]);

  // Handle URL changes to extract YouTube ID
  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, youtubeUrl: url }));
    const extracted = extractYouTubeId(url);
    if (extracted) {
      setDetectedYtId(extracted);
      setUrlError(null);
    } else if (url.trim().length > 0) {
      setDetectedYtId(null);
      setUrlError('Could not detect a valid 11-character YouTube video ID from this URL.');
    } else {
      setDetectedYtId(null);
      setUrlError(null);
    }
  };

  // Filtered Videos
  const filteredVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter(video => {
        let matchesStatus = true;
        if (selectedFilter === 'Published') matchesStatus = video.published;
        if (selectedFilter === 'Unpublished') matchesStatus = !video.published;
        if (selectedFilter === 'Featured') matchesStatus = video.featured;

        let matchesCat = selectedCategory === 'All' || video.category === selectedCategory;

        let matchesSearch = searchQuery === '' || 
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesStatus && matchesCat && matchesSearch;
      });
  }, [videos, selectedFilter, selectedCategory, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setFormData({
      youtubeUrl: '',
      title: '',
      description: '',
      category: 'Music Videos',
      customCategory: '',
      tags: '',
      published: true,
      featured: false,
      associatedProductId: '',
      associatedProductType: 'Single Beat'
    });
    setDetectedYtId(null);
    setUrlError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (video: VideoRecord) => {
    setEditingVideo(video);
    setFormData({
      youtubeUrl: video.youtubeUrl,
      title: video.title,
      description: video.description,
      category: DEFAULT_CATEGORIES.includes(video.category) ? video.category : 'Other',
      customCategory: DEFAULT_CATEGORIES.includes(video.category) ? '' : video.category,
      tags: video.tags.join(', '),
      published: video.published,
      featured: video.featured,
      associatedProductId: video.associatedProductId || '',
      associatedProductType: video.associatedProductType || 'Single Beat'
    });
    setDetectedYtId(video.youtubeId);
    setUrlError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = detectedYtId || extractYouTubeId(formData.youtubeUrl);
    if (!ytId) {
      setUrlError('Please enter a valid YouTube URL or video ID.');
      return;
    }

    const finalCategory = formData.category === 'Other' && formData.customCategory.trim()
      ? formData.customCategory.trim()
      : formData.category;

    const parsedTags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    if (editingVideo) {
      const updated: VideoRecord = {
        ...editingVideo,
        youtubeId: ytId,
        youtubeUrl: formData.youtubeUrl,
        title: formData.title || `YouTube Video (${ytId})`,
        description: formData.description,
        thumbnailUrl: thumbnail,
        category: finalCategory,
        tags: parsedTags,
        published: formData.published,
        featured: formData.featured,
        associatedProductId: formData.associatedProductId || undefined,
        associatedProductType: formData.associatedProductId ? formData.associatedProductType : undefined
      };
      updateVideo(updated);
    } else {
      const newVideo: VideoRecord = {
        id: `VID-${Date.now()}`,
        youtubeId: ytId,
        youtubeUrl: formData.youtubeUrl,
        title: formData.title || `YouTube Video (${ytId})`,
        description: formData.description,
        thumbnailUrl: thumbnail,
        category: finalCategory,
        tags: parsedTags,
        dateAdded: new Date().toISOString().split('T')[0],
        published: formData.published,
        featured: formData.featured,
        sortOrder: videos.length,
        associatedProductId: formData.associatedProductId || undefined,
        associatedProductType: formData.associatedProductId ? formData.associatedProductType : undefined
      };
      addVideo(newVideo);
    }

    setIsModalOpen(false);
  };

  const handleTogglePublish = (video: VideoRecord) => {
    updateVideo({ ...video, published: !video.published });
  };

  const handleToggleFeature = (video: VideoRecord) => {
    updateVideo({ ...video, featured: !video.featured });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const list = [...filteredVideos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Update sortOrder on list
    const updated = list.map((item, idx) => ({ ...item, sortOrder: idx }));
    reorderVideos(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <Video className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Videos Library</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Embed YouTube videos, showcase beat previews, music videos, and behind-the-scenes content.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors text-sm shadow-lg shadow-red-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add YouTube Video</span>
        </button>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search videos by title, description, category, or tags..."
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

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-gray-400 flex items-center gap-1.5 mr-1 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { key: 'All', label: `All Videos (${videos.length})` },
            { key: 'Published', label: 'Published' },
            { key: 'Unpublished', label: 'Unpublished' },
            { key: 'Featured', label: 'Featured' }
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

          <span className="text-gray-600 mx-1">|</span>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#121721] border border-white/10 rounded-full px-3 py-1 text-xs font-medium text-gray-300 focus:outline-none shrink-0"
          >
            <option value="All">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video, idx) => (
            <div
              key={video.id}
              className={`bg-[#121721] border rounded-xl overflow-hidden flex flex-col justify-between transition-all hover:border-white/20 relative group ${
                video.featured ? 'border-red-500/40' : 'border-white/10'
              }`}
            >
              <div>
                {/* Video Thumbnail Box */}
                <div className="relative aspect-video bg-black overflow-hidden group">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreviewVideo(video)}
                      className="p-3 bg-red-600/90 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      title="Play Preview"
                    >
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      video.published ? 'bg-emerald-500/90 text-white' : 'bg-gray-800/90 text-gray-300'
                    }`}>
                      {video.published ? 'Published' : 'Draft'}
                    </span>
                    {video.featured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-black flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[11px] font-medium text-gray-200 border border-white/10">
                      {video.category}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-white text-base tracking-tight line-clamp-1 group-hover:text-red-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                    {video.description || 'No description added.'}
                  </p>

                  {/* Tags */}
                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {video.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-4 py-3 bg-black/20 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePublish(video)}
                    className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                      video.published ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-white/10'
                    }`}
                    title={video.published ? 'Unpublish' : 'Publish'}
                  >
                    {video.published ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleToggleFeature(video)}
                    className={`p-1.5 rounded text-xs transition-colors ${
                      video.featured ? 'text-amber-400 hover:bg-amber-500/10' : 'text-gray-400 hover:bg-white/10'
                    }`}
                    title={video.featured ? 'Unfeature' : 'Feature'}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  {/* Reorder buttons */}
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 rounded hover:bg-white/10"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === filteredVideos.length - 1}
                    className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 rounded hover:bg-white/10"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewVideo(video)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                    title="Preview Video"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(video)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                    title="Edit Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(video.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                    title="Remove Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delete Overlay */}
              {deleteConfirmId === video.id && (
                <div className="absolute inset-0 bg-[#0B0E14]/95 p-4 flex flex-col items-center justify-center text-center z-20 space-y-3 border border-red-500/30">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-white font-semibold text-sm">Remove video from NightRunna?</p>
                    <p className="text-xs text-gray-400 mt-0.5">This removes the listing from your store. It will not delete the video from YouTube.</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { deleteVideo(video.id); setDeleteConfirmId(null); }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-md"
                    >
                      Remove
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
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">No videos added yet.</h3>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? `No video matches "${searchQuery}". Try a different filter.`
                : `Embed your music videos, beat visualizers, and behind-the-scenes content.`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(selectedFilter !== 'All' || selectedCategory !== 'All' || searchQuery !== '') && (
              <button
                onClick={() => { setSelectedFilter('All'); setSelectedCategory('All'); setSearchQuery(''); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add YouTube Video</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121721] border border-white/10 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                {editingVideo ? 'Edit YouTube Video' : 'Add YouTube Video'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* YouTube URL input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  YouTube Video Link / URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={formData.youtubeUrl}
                  onChange={e => handleUrlChange(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50"
                />
                {detectedYtId && (
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Detected YouTube Video ID: <code className="bg-emerald-500/10 px-1 py-0.5 rounded">{detectedYtId}</code>
                  </p>
                )}
                {urlError && (
                  <p className="text-xs text-red-400 mt-1">{urlError}</p>
                )}
              </div>

              {/* Detected Thumbnail Preview */}
              {detectedYtId && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${detectedYtId}/hqdefault.jpg`}
                    alt="YouTube Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] text-gray-300">
                    Thumbnail auto-generated from YouTube
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Off the Wall - Official Music Video"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Add details, credits, or social links..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {formData.category === 'Other' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Custom Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vlogs, Gear Review"
                      value={formData.customCategory}
                      onChange={e => setFormData({ ...formData, customCategory: e.target.value })}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="hiphop, dark, trap, live, behindthescenes"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Optional Relationship Link */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-red-400" />
                  Optional Content Association
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={formData.associatedProductType}
                    onChange={e => setFormData({ ...formData, associatedProductType: e.target.value as any })}
                    className="bg-[#0B0E14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Single Beat">Single Beat</option>
                    <option value="Beat Pack">Beat Pack</option>
                    <option value="Tracklist">Tracklist</option>
                    <option value="Promotion">Promotion</option>
                  </select>

                  <select
                    value={formData.associatedProductId}
                    onChange={e => setFormData({ ...formData, associatedProductId: e.target.value })}
                    className="bg-[#0B0E14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">None (Standalone Video)</option>
                    {formData.associatedProductType === 'Single Beat' && beats.map(b => (
                      <option key={b.id} value={b.id}>{b.title} ({b.id})</option>
                    ))}
                    {formData.associatedProductType === 'Beat Pack' && beatPacks.map(p => (
                      <option key={p.packId} value={p.packId}>{p.packName} ({p.packId})</option>
                    ))}
                    {formData.associatedProductType === 'Tracklist' && tracklists.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    {formData.associatedProductType === 'Promotion' && promotions.map(pr => (
                      <option key={pr.id} value={pr.id}>{pr.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white font-medium select-none">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={e => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-red-600 focus:ring-0 bg-[#0B0E14]"
                  />
                  <span>Publish to Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-white font-medium select-none">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-red-600 focus:ring-0 bg-[#0B0E14]"
                  />
                  <span>Mark as Featured</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!detectedYtId && !extractYouTubeId(formData.youtubeUrl)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-lg shadow-red-600/20"
                >
                  {editingVideo ? 'Save Changes' : 'Embed Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Player Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121721] border border-white/10 rounded-xl max-w-3xl w-full p-4 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base truncate pr-4">{previewVideo.title}</h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-white/10">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${previewVideo.youtubeId}?autoplay=1`}
                title={previewVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span>Category: <strong className="text-white">{previewVideo.category}</strong></span>
              <a
                href={previewVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:underline flex items-center gap-1 font-medium"
              >
                Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
