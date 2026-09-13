import React, { useState, useMemo } from 'react';
import { useStore, VideoRecord } from '../../contexts/StoreContext';
import { Video, Play, Search, Filter, Sparkles, Film, ExternalLink, X } from 'lucide-react';

export function VideosPage() {
  const { videos } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<VideoRecord | null>(null);

  // Filter only published videos for public view
  const publishedVideos = useMemo(() => {
    return videos
      .filter(v => v.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [videos]);

  const categories = useMemo(() => {
    const cats = new Set(publishedVideos.map(v => v.category));
    return ['All', ...Array.from(cats)];
  }, [publishedVideos]);

  const filteredVideos = useMemo(() => {
    return publishedVideos.filter(video => {
      const matchesCat = selectedCategory === 'All' || video.category === selectedCategory;
      const matchesSearch = searchQuery === '' ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [publishedVideos, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider">
          <Video className="w-4 h-4" />
          NightRunna Video Vault
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Music Videos & Visualizers
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Watch official music videos, beat previews, studio tutorials, and behind-the-scenes footage from NightRunna.
        </p>
      </div>

      {/* Search & Category Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search videos & tags..."
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

      {/* Videos Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <div
              key={video.id}
              className={`bg-zinc-900 border rounded-2xl overflow-hidden group transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-red-900/10 flex flex-col justify-between ${
                video.featured ? 'border-red-500/30' : 'border-zinc-800'
              }`}
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActiveVideo(video)}
                      className="p-4 bg-red-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
                    >
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </button>
                  </div>

                  {video.featured && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-black px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> Featured
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-medium text-zinc-300 border border-white/10">
                    {video.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-red-400 transition-colors line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                    {video.description || 'Watch the latest music video preview.'}
                  </p>

                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {video.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 bg-zinc-800 rounded-md text-[10px] text-zinc-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="p-4 bg-zinc-950/50 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">{video.dateAdded}</span>
                <button
                  onClick={() => setActiveVideo(video)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">No Videos Available</h3>
            <p className="text-zinc-400 text-sm mt-1">
              {searchQuery || selectedCategory !== 'All'
                ? 'No published videos match your search or filter.'
                : 'Videos published in the Studio Dashboard will appear here for public viewing.'}
            </p>
          </div>
        </div>
      )}

      {/* Video Lightbox Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-lg truncate pr-4">{activeVideo.title}</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <span>Category: <strong className="text-white">{activeVideo.category}</strong></span>
              <a
                href={activeVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
