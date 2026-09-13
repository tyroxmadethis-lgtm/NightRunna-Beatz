import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Play, Pause, ShoppingCart, Download, Share2, 
  Tag, Music, Box, Check, Sparkles, Filter, Disc
} from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { ShareModal } from '../../components/ShareModal';

// Circular discovery items specifications
const DISCOVERY_CIRCLES = [
  { id: 'all', label: 'All Beats', tag: 'All', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', bg: 'from-indigo-600 to-purple-800' },
  { id: 'trap', label: 'Trap', tag: 'Trap', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80', bg: 'from-amber-500 to-red-700' },
  { id: 'freestyle', label: 'Freestyle', tag: 'Freestyle', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=300&q=80', bg: 'from-emerald-500 to-teal-800' },
  { id: 'beef-rap', label: 'Beef Rap Type Beat', tag: 'Beef Rap', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80', bg: 'from-rose-600 to-red-900' },
  { id: 'freestyle-inst', label: 'Freestyle Instrumental', tag: 'Freestyle Instrumental', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80', bg: 'from-blue-600 to-cyan-800' },
  { id: 'free-profit', label: 'Free For Profit', tag: 'Free For Profit', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80', bg: 'from-green-600 to-emerald-900' },
  { id: 'beat-freestyle', label: 'Beat Freestyle', tag: 'Beat Freestyle', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80', bg: 'from-violet-600 to-indigo-900' },
  { id: 'rap-type', label: 'Rap Type Beat', tag: 'Rap Type Beat', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=300&q=80', bg: 'from-fuchsia-600 to-pink-900' },
  { id: 'drill', label: 'Drill', tag: 'Drill', image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=300&q=80', bg: 'from-orange-600 to-amber-900' },
  { id: 'synthwave', label: 'Synthwave', tag: 'Synthwave', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80', bg: 'from-purple-600 to-pink-800' }
];

export function CollectionsPage() {
  const navigate = useNavigate();
  const { beats: storeBeats, beatPacks: storeBeatPacks, recordDownload, recordShare, recordView, getActiveFlashSale } = useStore();
  const activeFlashSale = getActiveFlashSale();
  const { currentTrack, isPlaying, togglePlayPause, playTrack } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'All' | 'Single Beat' | 'Beat Pack' | 'Free Download'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareTrackTarget, setShareTrackTarget] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  React.useEffect(() => {
    recordView(undefined, 'Storefront');
  }, []);

  // Real store catalog items only (No demo/placeholder beats)
  const combinedProducts = useMemo(() => {
    const formattedStoreBeats = storeBeats.map(b => {
      let artworkUrl: string | null = null;
      if (b.files?.artwork) {
        if (typeof b.files.artwork === 'string') artworkUrl = b.files.artwork;
        else if (b.files.artwork instanceof Blob || b.files.artwork instanceof File) {
          artworkUrl = URL.createObjectURL(b.files.artwork);
        }
      } else if ((b as any).artworkUrl) {
        artworkUrl = (b as any).artworkUrl;
      }

      return {
        id: b.id,
        title: b.title,
        price: b.price || '39.99',
        metadata: b.metadata || { genre: 'Trap', bpm: '140', key: 'C Minor', mood: 'Dark', tags: ['Trap'], description: '', producer: 'NightRunna' },
        freeDownloadEnabled: b.freeDownloadEnabled || false,
        freeDownloadFile: b.freeDownloadFile,
        productType: 'Single Beat' as const,
        files: b.files,
        audioUrl: b.audioUrl,
        artworkUrl: artworkUrl
      };
    });

    const formattedStorePacks = storeBeatPacks.map(p => {
      let coverUrl: string | null = null;
      if (p.coverImage) {
        if (typeof p.coverImage === 'string') coverUrl = p.coverImage;
        else if (p.coverImage instanceof Blob || p.coverImage instanceof File) {
          coverUrl = URL.createObjectURL(p.coverImage);
        }
      }

      return {
        packId: p.packId,
        id: p.packId,
        packName: p.packName,
        title: p.packName,
        price: p.price || '59.99',
        beats: p.beats || [],
        freeDownloadEnabled: p.freeDownloadEnabled || false,
        freeDownloadFile: p.freeDownloadFile,
        productType: 'Beat Pack' as const,
        coverUrl: coverUrl,
        tags: ['Beat Pack', 'Trap']
      };
    });

    return [
      ...formattedStoreBeats,
      ...formattedStorePacks
    ];
  }, [storeBeats, storeBeatPacks]);

  // Filter catalog based on Search query, Discovery Tag, and Category Filter
  const filteredProducts = useMemo(() => {
    return combinedProducts.filter(item => {
      const isBeat = item.productType === 'Single Beat';
      const itemTitle = isBeat ? item.title : (item as any).packName;
      const itemTags = isBeat 
        ? (item.metadata?.tags || []) 
        : ((item as any).tags || ['Beat Pack']);
      const genre = isBeat ? item.metadata?.genre : 'Trap';
      const bpm = isBeat ? item.metadata?.bpm : '';
      const key = isBeat ? item.metadata?.key : '';
      const mood = isBeat ? item.metadata?.mood : '';
      const producer = isBeat ? (item.metadata?.producer || 'NightRunna') : 'NightRunna';
      const freeDownload = item.freeDownloadEnabled;

      // Category filter check
      if (selectedCategoryFilter === 'Single Beat' && item.productType !== 'Single Beat') return false;
      if (selectedCategoryFilter === 'Beat Pack' && item.productType !== 'Beat Pack') return false;
      if (selectedCategoryFilter === 'Free Download' && !freeDownload) return false;

      // Circular Discovery Tag filter check
      if (selectedTag !== 'All') {
        const lowerSelected = selectedTag.toLowerCase();
        const matchesTag = itemTags.some((t: string) => t.toLowerCase().includes(lowerSelected));
        const matchesGenre = genre && genre.toLowerCase().includes(lowerSelected);
        const matchesTitle = itemTitle.toLowerCase().includes(lowerSelected);

        if (!matchesTag && !matchesGenre && !matchesTitle) {
          if (selectedTag === 'Trap' && genre !== 'Trap' && !itemTags.includes('Trap')) return false;
          if (selectedTag === 'Free For Profit' && !freeDownload) return false;
          if (selectedTag !== 'Trap' && selectedTag !== 'Free For Profit' && !matchesTag && !matchesTitle) return false;
        }
      }

      // Search query text check
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesText = 
          itemTitle.toLowerCase().includes(q) ||
          producer.toLowerCase().includes(q) ||
          (genre && genre.toLowerCase().includes(q)) ||
          (bpm && bpm.toString().includes(q)) ||
          (key && key.toLowerCase().includes(q)) ||
          (mood && mood.toLowerCase().includes(q)) ||
          itemTags.some((t: string) => t.toLowerCase().includes(q)) ||
          item.productType.toLowerCase().includes(q) ||
          (freeDownload && 'free download'.includes(q));

        if (!matchesText) return false;
      }

      return true;
    });
  }, [combinedProducts, searchQuery, selectedTag, selectedCategoryFilter]);

  const handlePlayProduct = (product: any) => {
    const isBeat = product.productType === 'Single Beat';
    const prodId = isBeat ? product.id : product.packId;
    const prodTitle = isBeat ? product.title : product.packName;
    const prodProducer = isBeat ? (product.metadata?.producer || 'NightRunna') : 'NightRunna';

    if (currentTrack?.id === prodId.toString()) {
      togglePlayPause();
    } else {
      let audioUrl: string | undefined = undefined;
      if (isBeat) {
        if (product.files?.wav) {
          audioUrl = typeof product.files.wav === 'string' ? product.files.wav : (product.files.wav instanceof Blob || product.files.wav instanceof File ? URL.createObjectURL(product.files.wav) : undefined);
        } else if (product.files?.mp3) {
          audioUrl = typeof product.files.mp3 === 'string' ? product.files.mp3 : (product.files.mp3 instanceof Blob || product.files.mp3 instanceof File ? URL.createObjectURL(product.files.mp3) : undefined);
        } else if (product.files?.m4a) {
          audioUrl = typeof product.files.m4a === 'string' ? product.files.m4a : (product.files.m4a instanceof Blob || product.files.m4a instanceof File ? URL.createObjectURL(product.files.m4a) : undefined);
        } else if (product.audioUrl) {
          audioUrl = product.audioUrl;
        }
      }

      playTrack({
        id: prodId.toString(),
        title: prodTitle,
        producer: prodProducer,
        price: product.price,
        audioUrl,
        coverUrl: product.artworkUrl || product.coverUrl
      });
    }
  };

  const handleBuyProduct = (product: any) => {
    const isBeat = product.productType === 'Single Beat';
    const prodId = isBeat ? product.id : product.packId;
    navigate('/checkout', { 
      state: { 
        productId: prodId.toString(), 
        productType: product.productType,
        price: product.price 
      } 
    });
  };

  const handleFreeDownloadClick = (product: any) => {
    if (!product.freeDownloadEnabled) return;

    const isBeat = product.productType === 'Single Beat';
    const prodId = isBeat ? product.id : product.packId;
    const prodTitle = isBeat ? product.title : product.packName;

    // Retrieve configured real audio file
    const downloadableFile = product.freeDownloadFile || product.files?.wav || product.files?.mp3 || product.files?.m4a || product.files?.stems || product.packFile;

    if (!downloadableFile) {
      alert(`No downloadable audio file attached to "${prodTitle}". Please configure a valid downloadable file in Studio.`);
      return;
    }

    recordDownload({
      productId: prodId,
      productTitle: prodTitle,
      productType: product.productType,
      type: 'Free'
    });

    if (downloadableFile instanceof Blob || downloadableFile instanceof File) {
      const url = URL.createObjectURL(downloadableFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = (downloadableFile as File).name || `${prodTitle}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (typeof downloadableFile === 'string') {
      const a = document.createElement('a');
      a.href = downloadableFile;
      a.download = `${prodTitle}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = async (product: any) => {
    const isBeat = product.productType === 'Single Beat';
    const prodId = isBeat ? product.id : product.packId;
    const prodTitle = isBeat ? product.title : product.packName;
    recordShare(prodId, product.productType);

    const shareUrl = isBeat
      ? `${window.location.origin}/audio-player/${prodId}`
      : `${window.location.origin}/checkout?productId=${prodId}&productType=${encodeURIComponent(product.productType)}`;

    const shareData = {
      title: `NightRunna - ${prodTitle}`,
      text: `Check out "${prodTitle}" on NightRunna!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setCopiedId(prodId);
        setTimeout(() => setCopiedId(null), 2500);
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    setShareTrackTarget({
      id: prodId,
      title: prodTitle,
      producer: product.producer || 'NightRunna',
      artwork: product.artworkUrl || product.coverUrl,
      tags: product.tags,
      genre: product.genre,
      price: product.price?.toString()
    });
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* SECTION 1 — SEARCH (Music Store Search Area) */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center mb-6">
          <div className="inline-flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> NightRunna Music Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Explore <span className="text-indigo-500">Collections</span> & Beats
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-2">
            Search real instrumentals by title, BPM, key, mood, genre, or discovery tags.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search beats, packs, BPM (e.g. 140), key (e.g. C Minor), tags..."
              className="w-full bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 text-base rounded-full pl-12 pr-28 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-24 text-zinc-500 hover:text-white text-xs font-bold bg-zinc-800 px-2 py-1 rounded"
              >
                Clear
              </button>
            )}
            <button 
              className="absolute right-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-full transition-colors flex items-center gap-1.5"
            >
              Search
            </button>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {(['All', 'Single Beat', 'Beat Pack', 'Free Download'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategoryFilter === cat 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {cat === 'All' ? 'All Types' : cat === 'Single Beat' ? 'Single Beats' : cat === 'Beat Pack' ? 'Beat Packs' : 'Free Downloads'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 — HORIZONTAL CIRCULAR DISCOVERY CARDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Disc className="w-5 h-5 text-indigo-400" /> Discovery Collections
            </h2>
            <p className="text-xs text-zinc-400">Swipe horizontally to explore curated style tags and collections</p>
          </div>
          {selectedTag !== 'All' && (
            <button 
              onClick={() => setSelectedTag('All')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
            >
              Reset Tag Filter ({selectedTag})
            </button>
          )}
        </div>

        {/* HORIZONTAL SCROLLING ROW - Strictly horizontal scrolling */}
        <div className="flex items-center gap-6 overflow-x-auto pb-4 pt-2 px-2 snap-x scrollbar-none scroll-smooth">
          {DISCOVERY_CIRCLES.map((circle) => {
            const isSelected = selectedTag === circle.tag;
            return (
              <button
                key={circle.id}
                onClick={() => setSelectedTag(circle.tag)}
                className="group flex flex-col items-center shrink-0 snap-start focus:outline-none"
              >
                {/* Circle Container */}
                <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 transition-all duration-300 transform group-hover:scale-105 ${
                  isSelected 
                    ? 'ring-4 ring-indigo-500 shadow-xl shadow-indigo-500/20' 
                    : 'hover:ring-2 hover:ring-zinc-600'
                }`}>
                  <div className={`w-full h-full rounded-full overflow-hidden relative bg-gradient-to-br ${circle.bg} flex items-center justify-center`}>
                    <img 
                      src={circle.image} 
                      alt={circle.label}
                      className="w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-[2px] flex items-center justify-center">
                        <Check className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Circle Label */}
                <span className={`mt-3 text-xs sm:text-sm font-bold text-center max-w-[100px] sm:max-w-[115px] truncate transition-colors ${
                  isSelected ? 'text-indigo-400 font-extrabold' : 'text-zinc-300 group-hover:text-white'
                }`}>
                  {circle.label}
                </span>

                {circle.tag === 'Trap' && (
                  <span className="mt-0.5 text-[10px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Official Genre
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 3 — LARGE PRODUCT CARDS (Vertical Page Scroll) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Catalog Items <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full font-bold">{filteredProducts.length} Results</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {selectedTag !== 'All' ? `Showing results for collection "${selectedTag}"` : 'Browse all Single Beats and Beat Packs'}
            </p>
          </div>
        </div>

        {/* Product List / Cards */}
        {filteredProducts.length === 0 ? (
          combinedProducts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl">
              <Music className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-1">No Beats in Catalog Yet</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
                Your collections catalog is empty. Upload your real beats or beat packs in Studio to display them here in your store.
              </p>
              <button 
                onClick={() => navigate('/studio')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-full transition-colors cursor-pointer"
              >
                Go to Studio Upload
              </button>
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <Music className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-1">No Matching Products</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
                No beats or packs matched your search query or collection filter. Try searching for a different term or tag.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedTag('All'); setSelectedCategoryFilter('All'); }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-full transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-6">
            {filteredProducts.map((product) => {
              const isBeat = product.productType === 'Single Beat';
              const prodId = isBeat ? product.id : product.packId;
              const prodTitle = isBeat ? product.title : product.packName;
              const producer = isBeat ? (product.metadata?.producer || 'NightRunna') : 'NightRunna';
              const isCurrentlyPlaying = currentTrack?.id === prodId.toString() && isPlaying;
              const tags = isBeat ? (product.metadata?.tags || ['Trap']) : ((product as any).tags || ['Beat Pack']);
              const artwork = isBeat ? product.artworkUrl : (product as any).coverUrl;

              return (
                <div 
                  key={prodId}
                  className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  {/* Left: Artwork + Title + Tags */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
                    {/* Large Artwork */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-zinc-800 rounded-xl overflow-hidden shrink-0 shadow-md group-hover:shadow-indigo-500/10 transition-shadow">
                      {artwork ? (
                        <img src={artwork} alt={prodTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                          {isBeat ? <Music className="w-10 h-10 text-zinc-600" /> : <Box className="w-10 h-10 text-zinc-600" />}
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <button 
                        onClick={() => handlePlayProduct(product)}
                        className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          {isCurrentlyPlaying ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6 ml-0.5" />
                          )}
                        </div>
                      </button>

                      {/* Product Type Indicator Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md text-white shadow ${
                          isBeat ? 'bg-indigo-600/90' : 'bg-purple-600/90'
                        }`}>
                          {isBeat ? 'Single Beat' : 'Beat Pack'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Info */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-zinc-500 font-mono">ID: {prodId}</span>
                        {isBeat && product.metadata?.bpm && (
                          <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                            {product.metadata.bpm} BPM
                          </span>
                        )}
                        {isBeat && product.metadata?.key && (
                          <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                            {product.metadata.key}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {prodTitle}
                      </h3>

                      <p className="text-sm font-semibold text-zinc-400">
                        Produced by <span className="text-zinc-200">{producer}</span>
                      </p>

                      {isBeat && product.metadata?.description && (
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          {product.metadata.description}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((tag: string) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className="text-[11px] font-bold text-zinc-400 bg-zinc-800/80 hover:bg-zinc-700 hover:text-white px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3 text-zinc-500" /> {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Pricing */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-800 gap-4 shrink-0">
                    <div className="text-left lg:text-right">
                      {(() => {
                        const origPrice = parseFloat(product.price) || 39.99;
                        const isPack = !isBeat;
                        const applies = activeFlashSale && (!isPack || activeFlashSale.includeBeatPacks !== false);
                        
                        if (applies && activeFlashSale) {
                          const discAmount = activeFlashSale.discountType === 'Percentage' 
                            ? (origPrice * (activeFlashSale.discountValue || 0)) / 100 
                            : (activeFlashSale.discountValue || 0);
                          const finalP = Math.max(0, origPrice - discAmount);

                          return (
                            <div>
                              <div className="flex items-center gap-2 lg:justify-end">
                                <span className="text-sm font-bold text-zinc-500 line-through">${origPrice.toFixed(2)}</span>
                                <span className="text-2xl font-black text-red-400">${finalP.toFixed(2)} <span className="text-xs font-normal text-zinc-400">USD</span></span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 lg:justify-end">
                                <span className="text-[10px] font-extrabold uppercase text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                                  🔥 {activeFlashSale.discountType === 'Percentage' ? `${activeFlashSale.discountValue}% OFF` : `$${activeFlashSale.discountValue} OFF`}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="text-2xl font-black text-white">
                            ${product.price} <span className="text-xs font-normal text-zinc-400">USD</span>
                          </div>
                        );
                      })()}

                      {product.freeDownloadEnabled && (
                        <span className="inline-block text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-1">
                          Free Download Available
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      {/* Share Button */}
                      <button 
                        onClick={() => handleShare(product)}
                        title="Share Product"
                        className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl font-semibold transition-colors flex items-center justify-center shrink-0"
                      >
                        {copiedId === prodId ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                      </button>

                      {/* Free Download Button (if enabled) */}
                      {product.freeDownloadEnabled && (
                        <button 
                          onClick={() => handleFreeDownloadClick(product)}
                          className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-indigo-400 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0"
                        >
                          <Download className="w-4 h-4" /> Free
                        </button>
                      )}

                      {/* Buy / Checkout Button */}
                      <button 
                        onClick={() => handleBuyProduct(product)}
                        className="flex-1 sm:flex-initial px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        track={shareTrackTarget}
      />
    </div>
  );
}
