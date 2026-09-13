import React, { useState, useMemo, useRef } from 'react';
import { useStore, PhotoRecord } from '../../contexts/StoreContext';
import { 
  Image as ImageIcon, Plus, Search, Eye, Edit3, Trash2, Tag, 
  Sparkles, Filter, ArrowUp, ArrowDown, X, ShieldAlert,
  Upload, Globe, EyeOff, Link2, CheckCircle2, Maximize2
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Producer',
  'Studio',
  'Beats',
  'Beat Packs',
  'Artwork',
  'Events',
  'Behind the Scenes',
  'Merch',
  'Branding',
  'Other'
];

export function Photos() {
  const { photos, addPhoto, updatePhoto, deletePhoto, reorderPhotos, beats, beatPacks, tracklists, promotions, addFile } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Published' | 'Unpublished' | 'Featured'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoRecord | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Studio',
    customCategory: '',
    tags: '',
    published: true,
    featured: false,
    associatedProductId: '',
    associatedProductType: 'Single Beat' as 'Single Beat' | 'Beat Pack' | 'Tracklist' | 'Promotion',
    imageUrl: '',
    filename: '',
    fileSize: ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Categories list including custom ones in use
  const categoriesList = useMemo(() => {
    const customInUse = photos.map(p => p.category).filter(c => !DEFAULT_CATEGORIES.includes(c));
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...customInUse]));
  }, [photos]);

  // Filtered Photos
  const filteredPhotos = useMemo(() => {
    return [...photos]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter(photo => {
        let matchesStatus = true;
        if (selectedFilter === 'Published') matchesStatus = photo.published;
        if (selectedFilter === 'Unpublished') matchesStatus = !photo.published;
        if (selectedFilter === 'Featured') matchesStatus = photo.featured;

        let matchesCat = selectedCategory === 'All' || photo.category === selectedCategory;

        let matchesSearch = searchQuery === '' || 
          photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesStatus && matchesCat && matchesSearch;
      });
  }, [photos, selectedFilter, selectedCategory, searchQuery]);

  // File Upload Reader (supports iPad photo library, file picker & drag/drop)
  const handleFileSelect = (file: File) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setImageError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    setImageError(null);
    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        imageUrl: dataUrl,
        filename: file.name,
        fileSize: formattedSize,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPhoto(null);
    setFormData({
      title: '',
      description: '',
      category: 'Studio',
      customCategory: '',
      tags: '',
      published: true,
      featured: false,
      associatedProductId: '',
      associatedProductType: 'Single Beat',
      imageUrl: '',
      filename: '',
      fileSize: ''
    });
    setImageError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (photo: PhotoRecord) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description,
      category: DEFAULT_CATEGORIES.includes(photo.category) ? photo.category : 'Other',
      customCategory: DEFAULT_CATEGORIES.includes(photo.category) ? '' : photo.category,
      tags: photo.tags.join(', '),
      published: photo.published,
      featured: photo.featured,
      associatedProductId: photo.associatedProductId || '',
      associatedProductType: photo.associatedProductType || 'Single Beat',
      imageUrl: photo.imageUrl,
      filename: photo.filename,
      fileSize: photo.fileSize
    });
    setImageError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setImageError('Please choose or upload a photo.');
      return;
    }

    const finalCategory = formData.category === 'Other' && formData.customCategory.trim()
      ? formData.customCategory.trim()
      : formData.category;

    const parsedTags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (editingPhoto) {
      const updated: PhotoRecord = {
        ...editingPhoto,
        title: formData.title || 'Untitled Photo',
        description: formData.description,
        category: finalCategory,
        tags: parsedTags,
        published: formData.published,
        featured: formData.featured,
        imageUrl: formData.imageUrl,
        filename: formData.filename,
        fileSize: formData.fileSize,
        associatedProductId: formData.associatedProductId || undefined,
        associatedProductType: formData.associatedProductId ? formData.associatedProductType : undefined
      };
      updatePhoto(updated);
    } else {
      const photoId = `PHOTO-${Date.now()}`;
      const newPhoto: PhotoRecord = {
        id: photoId,
        title: formData.title || 'Untitled Photo',
        description: formData.description,
        imageUrl: formData.imageUrl,
        filename: formData.filename || 'photo.jpg',
        fileSize: formData.fileSize || '1 MB',
        category: finalCategory,
        tags: parsedTags,
        dateUploaded: new Date().toISOString().split('T')[0],
        published: formData.published,
        featured: formData.featured,
        sortOrder: photos.length,
        associatedProductId: formData.associatedProductId || undefined,
        associatedProductType: formData.associatedProductId ? formData.associatedProductType : undefined
      };
      addPhoto(newPhoto);

      // Register in project file storage system as well
      addFile({
        id: photoId,
        filename: formData.filename || 'photo.jpg',
        type: 'ARTWORK',
        size: formData.fileSize || '1 MB',
        uploadDate: new Date().toISOString().split('T')[0]
      });
    }

    setIsModalOpen(false);
  };

  const handleTogglePublish = (photo: PhotoRecord) => {
    updatePhoto({ ...photo, published: !photo.published });
  };

  const handleToggleFeature = (photo: PhotoRecord) => {
    updatePhoto({ ...photo, featured: !photo.featured });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const list = [...filteredPhotos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const updated = list.map((item, idx) => ({ ...item, sortOrder: idx }));
    reorderPhotos(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Photos Gallery</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Upload and organize studio photography, producer press shots, artwork, and event media.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors text-sm shadow-lg shadow-red-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search photos by title, description, category, or tags..."
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
            { key: 'All', label: `All Photos (${photos.length})` },
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

      {/* Photo Gallery Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              className={`bg-[#121721] border rounded-xl overflow-hidden flex flex-col justify-between transition-all hover:border-white/20 relative group ${
                photo.featured ? 'border-red-500/40' : 'border-white/10'
              }`}
            >
              <div>
                {/* Photo Aspect Container */}
                <div className="relative aspect-square bg-black overflow-hidden group">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreviewPhoto(photo)}
                      className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full shadow-lg"
                      title="Full Screen View"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      photo.published ? 'bg-emerald-500/90 text-white' : 'bg-gray-800/90 text-gray-300'
                    }`}>
                      {photo.published ? 'Pub' : 'Draft'}
                    </span>
                    {photo.featured && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/90 text-black flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-medium text-gray-300 border border-white/10">
                      {photo.category}
                    </span>
                  </div>
                </div>

                {/* Title & Info */}
                <div className="p-3 space-y-1">
                  <h3 className="font-bold text-white text-xs tracking-tight line-clamp-1 group-hover:text-red-400 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-gray-400 text-[11px] line-clamp-1">
                    {photo.description || photo.filename}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-3 py-2 bg-black/30 border-t border-white/5 flex items-center justify-between gap-1">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleTogglePublish(photo)}
                    className={`p-1 rounded text-xs transition-colors ${
                      photo.published ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-white/10'
                    }`}
                    title={photo.published ? 'Unpublish' : 'Publish'}
                  >
                    {photo.published ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleToggleFeature(photo)}
                    className={`p-1 rounded text-xs transition-colors ${
                      photo.featured ? 'text-amber-400 hover:bg-amber-500/10' : 'text-gray-400 hover:bg-white/10'
                    }`}
                    title={photo.featured ? 'Unfeature' : 'Feature'}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 rounded hover:bg-white/10"
                    title="Move Left/Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === filteredPhotos.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 rounded hover:bg-white/10"
                    title="Move Right/Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleOpenEditModal(photo)}
                    className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                    title="Edit Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(photo.id)}
                    className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delete Overlay */}
              {deleteConfirmId === photo.id && (
                <div className="absolute inset-0 bg-[#0B0E14]/95 p-3 flex flex-col items-center justify-center text-center z-20 space-y-2 border border-red-500/30">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                  <p className="text-white font-semibold text-xs">Remove photo?</p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 bg-white/10 text-white text-[10px] font-medium rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { deletePhoto(photo.id); setDeleteConfirmId(null); }}
                      className="px-2 py-1 bg-red-600 text-white text-[10px] font-medium rounded"
                    >
                      Delete
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
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">No photos uploaded yet.</h3>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? `No photo matches "${searchQuery}". Try a different filter.`
                : `Upload studio photos, artwork, behind-the-scenes press images, and event pictures.`}
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
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload / Edit Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121721] border border-white/10 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-red-500" />
                {editingPhoto ? 'Edit Photo Details' : 'Upload New Photo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload / Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Image File (JPG, PNG, WEBP) <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                {formData.imageUrl ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black group">
                    <img
                      src={formData.imageUrl}
                      alt="Uploaded Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg backdrop-blur-md"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                      dragActive
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }`}
                  >
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Tap to choose or drag image file here</p>
                      <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WEBP up to 15MB. Fully touch compatible on iPad.</p>
                    </div>
                  </div>
                )}

                {imageError && (
                  <p className="text-xs text-red-400 mt-1">{imageError}</p>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Photo Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. NightRunna Main Control Room"
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
                  rows={2}
                  placeholder="Add photo details, gear specifications, or location..."
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
                      placeholder="e.g. Gear, Awards"
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
                    placeholder="studio, analog, synth, studiob"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Optional Content Link */}
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
                    <option value="">None (Standalone Photo)</option>
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
                  <span>Publish to Public Gallery</span>
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
                  disabled={!formData.imageUrl}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-lg shadow-red-600/20"
                >
                  {editingPhoto ? 'Save Changes' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-gray-300 hover:text-white rounded-full bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={previewPhoto.imageUrl}
              alt={previewPhoto.title}
              className="max-h-[75vh] w-auto object-contain rounded-lg border border-white/10 shadow-2xl"
            />

            <div className="mt-4 text-center space-y-1">
              <h3 className="text-lg font-bold text-white">{previewPhoto.title}</h3>
              <p className="text-xs text-gray-400 max-w-lg">{previewPhoto.description || 'Uploaded image'}</p>
              <p className="text-[11px] text-gray-500 pt-1">Category: {previewPhoto.category} • Uploaded: {previewPhoto.dateUploaded}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
