import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, ShoppingCart, Disc, Download } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useStore } from '../../contexts/StoreContext';
import { CustomBeatRequestCTA } from '../../components/CustomBeatRequestCTA';
import { ParsedBeat } from '../../utils/zipParser';

export function Home() {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const { beats, recordView } = useStore();

  React.useEffect(() => {
    recordView(undefined, 'Storefront');
  }, []);

  const featuredBeats = beats.filter(b => b.featured === true);

  const getArtworkUrl = (beat: ParsedBeat) => {
    if (beat.files?.artwork) {
      if (typeof beat.files.artwork === 'string') return beat.files.artwork;
      if (beat.files.artwork instanceof Blob || beat.files.artwork instanceof File) {
        return URL.createObjectURL(beat.files.artwork);
      }
    }
    if ((beat as any).artworkUrl) return (beat as any).artworkUrl;
    return null;
  };

  const getAudioUrl = (beat: ParsedBeat) => {
    if (beat.audioUrl) return beat.audioUrl;
    if (beat.files?.wav) {
      if (typeof beat.files.wav === 'string') return beat.files.wav;
      if (beat.files.wav instanceof Blob || beat.files.wav instanceof File) return URL.createObjectURL(beat.files.wav);
    }
    if (beat.files?.mp3) {
      if (typeof beat.files.mp3 === 'string') return beat.files.mp3;
      if (beat.files.mp3 instanceof Blob || beat.files.mp3 instanceof File) return URL.createObjectURL(beat.files.mp3);
    }
    if (beat.files?.m4a) {
      if (typeof beat.files.m4a === 'string') return beat.files.m4a;
      if (beat.files.m4a instanceof Blob || beat.files.m4a instanceof File) return URL.createObjectURL(beat.files.m4a);
    }
    return undefined;
  };

  const handlePlayClick = (beat: ParsedBeat) => {
    if (currentTrack?.id === beat.id) {
      togglePlayPause();
    } else {
      playTrack({
        id: beat.id,
        title: beat.title,
        producer: beat.metadata?.producer || 'NightRunna',
        price: beat.price || '39.99',
        audioUrl: getAudioUrl(beat),
        coverUrl: getArtworkUrl(beat) || undefined
      });
    }
  };

  const handleCartClick = (beat: ParsedBeat) => {
    navigate('/checkout', { state: { productId: beat.id, productType: 'Single Beat' } });
  };

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900/40 to-zinc-900 border border-zinc-800 px-6 py-24 sm:py-32 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            The Ultimate Beat <span className="text-indigo-500">Marketplace</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Discover premium instrumentals, connect with top producers, and elevate your sound to the next level.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/collections')}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-lg transition-colors cursor-pointer"
            >
              Browse Beats
            </button>
            <button 
              onClick={() => navigate('/studio')}
              className="w-full sm:w-auto px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-medium text-lg transition-colors cursor-pointer"
            >
              Start Selling
            </button>
          </div>
        </div>
      </section>

      {/* Featured Beats */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Featured Beats</h2>
            <p className="text-zinc-400">Top picks from the NightRunna catalog</p>
          </div>
          <button 
            onClick={() => navigate('/collections')}
            className="text-indigo-400 hover:text-indigo-300 font-medium text-sm cursor-pointer"
          >
            View All
          </button>
        </div>
        
        {featuredBeats.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-zinc-900/40">
            <div className="h-12 w-12 bg-zinc-800/80 rounded-full flex items-center justify-center mb-4 text-indigo-400">
              <Disc className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Featured Beats Yet</h3>
            <p className="text-zinc-400 max-w-md text-sm">Featured beats will appear here when you feature a beat from Studio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBeats.map((beat) => {
              const artworkUrl = getArtworkUrl(beat);
              const tags = beat.metadata?.tags && beat.metadata.tags.length > 0 
                ? beat.metadata.tags 
                : [beat.metadata?.genre || 'Trap'];
              const producer = beat.metadata?.producer || 'NightRunna';
              const price = beat.price || '39.99';
              const bpm = beat.metadata?.bpm || '140';

              return (
                <div key={beat.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors flex flex-col">
                  <div className="aspect-square bg-zinc-800 relative overflow-hidden group-hover:bg-zinc-700 transition-colors flex items-center justify-center">
                    {artworkUrl ? (
                      <img 
                        src={artworkUrl} 
                        alt={beat.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-950/60 to-zinc-900 flex items-center justify-center">
                        <Disc className="h-16 w-16 text-zinc-700 group-hover:text-indigo-500/50 transition-colors" />
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handlePlayClick(beat)}
                      className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 shadow-xl cursor-pointer z-10"
                    >
                      {currentTrack?.id === beat.id && isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-1" />
                      )}
                    </button>

                    <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-medium text-white backdrop-blur-sm">
                      {bpm} BPM
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-zinc-100 truncate">{beat.title}</h3>
                      <p className="text-sm text-zinc-400 truncate mb-3">{producer}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.map(tag => (
                          <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 mt-auto">
                      <span className="font-bold text-white">${price}</span>
                      <button 
                        onClick={() => handleCartClick(beat)}
                        className="p-2 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                        title="Purchase / Select License"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Custom Beat Request CTA */}
      <CustomBeatRequestCTA />
    </div>
  );
}
