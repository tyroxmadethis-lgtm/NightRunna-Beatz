import React, { useState, useMemo } from 'react';
import { useStore, PhotoRecord } from '../../contexts/StoreContext';
import { Image as ImageIcon, Search, Filter, Sparkles, Maximize2, X } from 'lucide-react';

export function PhotosPage() {
  const { photos } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhoto, setActivePhoto] = useState<PhotoRecord | null>(null);

  // Filter published photos for public view
  const publishedPhotos = useMemo(() => {
    return photos
      .filter(p => p.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [photos]);

  const categories = useMemo(() => {
    const cats = new Set(publishedPhotos.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [publishedPhotos]);

  const filteredPhotos = useMemo(() => {
    return publishedPhotos.filter(photo => {
      const matchesCat = selectedCategory === 'All' || photo.category === selectedCategory;
      const matchesSearch = searchQuery === '' ||
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [publishedPhotos, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider">
          <ImageIcon className="w-4 h-4" />
          NightRunna Gallery
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Studio & Press Photography
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Explore producer studio setups, behind-the-scenes photography, custom beat artwork, and official press photos.
        </p>
      </div>

      {/* Search & Category Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search gallery & tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className={`bg-zinc-900 border rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-red-900/10 flex flex-col justify-between ${
                photo.featured ? 'border-red-500/40' : 'border-zinc-800'
              }`}
            >
              <div className="relative aspect-square bg-black overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                {photo.featured && (
                  <div className="absolute top-2.5 left-2.5 bg-amber-500 text-black px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </div>
                )}

                <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-medium text-zinc-300 border border-white/10">
                  {photo.category}
                </div>
              </div>

              <div className="p-3 space-y-1">
                <h3 className="font-bold text-white text-xs tracking-tight line-clamp-1 group-hover:text-red-400 transition-colors">
                  {photo.title}
                </h3>
                {photo.description && (
                  <p className="text-zinc-400 text-[11px] line-clamp-1">
                    {photo.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">No Photos Available</h3>
            <p className="text-zinc-400 text-sm mt-1">
              {searchQuery || selectedCategory !== 'All'
                ? 'No published photos match your search or filter.'
                : 'Photos uploaded and published in the Studio Dashboard will appear here.'}
            </p>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full flex flex-col items-center justify-center">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-12 right-0 p-2 text-zinc-300 hover:text-white rounded-full bg-zinc-800"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.title}
              className="max-h-[75vh] w-auto object-contain rounded-2xl border border-zinc-800 shadow-2xl"
            />

            <div className="mt-4 text-center space-y-1">
              <h3 className="text-xl font-bold text-white">{activePhoto.title}</h3>
              {activePhoto.description && (
                <p className="text-sm text-zinc-400 max-w-lg mx-auto">{activePhoto.description}</p>
              )}
              <div className="flex items-center justify-center gap-2 pt-1 text-xs text-zinc-500">
                <span>Category: <strong className="text-zinc-300">{activePhoto.category}</strong></span>
                <span>•</span>
                <span>Uploaded: {activePhoto.dateUploaded}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
