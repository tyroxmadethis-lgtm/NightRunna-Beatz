import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { Play, Pause, Share2, ShoppingCart, MessageSquare, Download, Clock, Music, Box, Check } from 'lucide-react';
import { ShareModal } from '../../components/ShareModal';

const getArtworkUrl = (artwork: any): string | null => {
  if (!artwork) return null;
  if (typeof artwork === 'string') return artwork;
  if (artwork instanceof Blob || artwork instanceof File) {
    try {
      return URL.createObjectURL(artwork);
    } catch {
      return null;
    }
  }
  return null;
};

export function AudioPlayerPage() {
  const { beats, beatPacks, recordDownload } = useStore();
  const { currentTrack, isPlaying, togglePlayPause, playTrack, getAnalyser, progress, duration, seek } = usePlayer();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [activeTab, setActiveTab] = useState<'RELATED' | 'COMMENTS' | 'PACKS'>('RELATED');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const selectedBeatId = id || queryId;
  const selectedBeatFromStore = selectedBeatId ? beats.find(b => b.id === selectedBeatId) : null;

  const displayTrack = selectedBeatFromStore 
    ? {
        id: selectedBeatFromStore.id,
        title: selectedBeatFromStore.title,
        producer: selectedBeatFromStore.metadata?.producer || 'NightRunna',
        artwork: selectedBeatFromStore.artworkUrl || selectedBeatFromStore.files?.artwork,
        audioUrl: selectedBeatFromStore.audioUrl,
        price: selectedBeatFromStore.price,
        bpm: selectedBeatFromStore.metadata?.bpm,
        freeDownloadEnabled: selectedBeatFromStore.freeDownloadEnabled,
        freeDownloadFile: selectedBeatFromStore.files?.freeDownload
      } 
    : currentTrack 
    ? {
        ...currentTrack,
        bpm: (currentTrack as any).bpm,
        freeDownloadEnabled: (currentTrack as any).freeDownloadEnabled,
        freeDownloadFile: (currentTrack as any).freeDownloadFile
      }
    : beats.length > 0 
    ? {
        id: beats[0].id,
        title: beats[0].title,
        producer: beats[0].metadata?.producer || 'NightRunna',
        artwork: beats[0].artworkUrl || beats[0].files?.artwork,
        audioUrl: beats[0].audioUrl,
        price: beats[0].price,
        bpm: beats[0].metadata?.bpm,
        freeDownloadEnabled: beats[0].freeDownloadEnabled,
        freeDownloadFile: beats[0].files?.freeDownload
      }
    : null;

  // Dynamically update document title and Open Graph social share metadata
  useEffect(() => {
    if (!displayTrack) return;

    const producerName = displayTrack.producer || 'NightRunna';
    const trackTitle = displayTrack.title || 'Beat';
    const pageTitle = `${trackTitle} by ${producerName} | NightRunna Beats`;
    document.title = pageTitle;

    const rawArtwork = getArtworkUrl(displayTrack.artwork);
    const artworkUrl = rawArtwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
    const tagsList = selectedBeatFromStore?.metadata?.tags || (displayTrack as any).tags || ['trap', 'dark', 'nightrunna'];
    const descriptionText = `Listen to "${trackTitle}" produced by ${producerName} on NightRunna. Tags: #${tagsList.join(' #')}`;

    const updateMetaTag = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property="')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) el.setAttribute('property', prop);
        } else if (selector.includes('name="')) {
          const nameAttr = selector.match(/name="([^"]+)"/)?.[1];
          if (nameAttr) el.setAttribute('name', nameAttr);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    updateMetaTag('meta[property="og:title"]', 'content', pageTitle);
    updateMetaTag('meta[property="og:description"]', 'content', descriptionText);
    updateMetaTag('meta[property="og:image"]', 'content', artworkUrl);
    updateMetaTag('meta[name="twitter:title"]', 'content', pageTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', descriptionText);
    updateMetaTag('meta[name="twitter:image"]', 'content', artworkUrl);
  }, [displayTrack, selectedBeatFromStore]);

  const handleCheckoutClick = (product: any, productType: 'Single Beat' | 'Beat Pack') => {
    navigate('/checkout', { state: { productId: product.id || product.packId, productType } });
  };

  const handleShareClick = async () => {
    if (!displayTrack) return;
    const shareUrl = `${window.location.origin}/audio-player/${displayTrack.id}`;
    const shareData = {
      title: `${displayTrack.title} by ${displayTrack.producer || 'NightRunna'} - NightRunna`,
      text: `Check out "${displayTrack.title}" produced by ${displayTrack.producer || 'NightRunna'}!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      setIsShareOpen(true);
    }
  };

  const handleFreeDownload = (product: any, type: 'Single Beat' | 'Beat Pack') => {
    if (!product.freeDownloadEnabled) return;

    recordDownload({
      productId: product.id || product.packId,
      productTitle: product.title || product.packName,
      productType: type,
      type: 'Free'
    });

    const file = product.freeDownloadFile || product.audioUrl;
    if (!file) {
      alert("Free download initiated!");
      return;
    }

    const downloadUrl = typeof file === 'string' ? file : URL.createObjectURL(file);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = typeof file === 'string' ? `${product.title || 'beat'}.mp3` : file.name;
    document.body.appendChild(a);
    a.click();
    if (typeof file !== 'string') {
      window.URL.revokeObjectURL(downloadUrl);
    }
  };

  // Waveform Visualizer Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = getAnalyser?.();

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // We'll draw a static waveform base, and overlay the frequency bars if playing
      const bars = 120; // 120 bars for 999px width
      const barWidth = (width / bars) - 2;

      let dataArray = new Uint8Array(bars);
      
      if (analyser && isPlaying) {
        // Get actual frequency data if playing
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        
        // Map high-res bins to our visual bars
        const step = Math.floor(freqData.length / bars);
        for (let i = 0; i < bars; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += freqData[(i * step) + j] || 0;
          }
          dataArray[i] = sum / (step || 1);
        }
      } else {
        // Draw static placeholder bars if paused/stopped
        for (let i = 0; i < bars; i++) {
          // Fake a sine wave pattern for empty visualizer
          dataArray[i] = Math.abs(Math.sin(i * 0.15)) * 40 + 20; 
        }
      }

      // Draw bars
      const progressPercent = duration > 0 ? progress / duration : 0;
      const progressBars = Math.floor(progressPercent * bars);

      for (let i = 0; i < bars; i++) {
        // Base height calculation + minimum height
        const barHeight = Math.max((dataArray[i] / 255) * height, 10);
        
        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2; // Center vertically like BeatStars

        // Color based on playback progress
        if (i < progressBars) {
          ctx.fillStyle = '#ffffff'; // Played
        } else {
          ctx.fillStyle = '#3f3f46'; // Unplayed (zinc-700)
        }

        // Draw rounded rect
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, Math.min(barWidth/2, 4));
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [getAnalyser, isPlaying, progress, duration]);

  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    seek(percent * duration);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const artworkSrc = getArtworkUrl(displayTrack?.artwork);

  return (
    <div className="flex justify-center w-full min-h-screen bg-[#09090b] pt-8 pb-32">
      <div 
        className="flex flex-col transition-all duration-300 w-full px-4"
        style={{ maxWidth: '999px' }}
      >
        {displayTrack ? (
          <>
            {/* Header / Track Info */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Artwork */}
              <div className="w-56 h-56 bg-zinc-800 rounded-lg shrink-0 flex items-center justify-center overflow-hidden shadow-2xl">
                {artworkSrc ? (
                  <img src={artworkSrc} alt={displayTrack.title || "Artwork"} className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-16 h-16 text-zinc-600" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-2">
                  <button 
                    onClick={() => {
                      if (currentTrack?.id === displayTrack.id) {
                        togglePlayPause();
                      } else {
                        playTrack(displayTrack as any);
                      }
                    }}
                    className="h-12 w-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                  >
                    {currentTrack?.id === displayTrack.id && isPlaying ? (
                      <Pause className="h-6 w-6 text-black" />
                    ) : (
                      <Play className="h-6 w-6 text-black ml-1" />
                    )}
                  </button>
                  <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{displayTrack.title}</h1>
                </div>
                
                <h2 className="text-lg font-bold text-zinc-300 mb-3">{displayTrack.producer || 'NightRunna'}</h2>
                
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-8">
                  {displayTrack.bpm && <span className="bg-zinc-800 px-2 py-1 rounded">BPM {displayTrack.bpm}</span>}
                  <span>Mar 27, 2026</span>
                  <span className="text-zinc-600 border border-zinc-700 px-2 py-1 rounded">BUY 1 GET 1 FREE | *ADD BEATS TO CART*</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleCheckoutClick(displayTrack, 'Single Beat')}
                      className="bg-white text-black px-6 py-2.5 rounded font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" /> 
                      {displayTrack.price ? `$${displayTrack.price}` : '$39.99'}
                    </button>
                    <button 
                      onClick={handleShareClick}
                      className="bg-zinc-800 text-white px-4 py-2.5 rounded font-bold text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer border border-zinc-700/50"
                    >
                      {copiedShare ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" /> COPIED!
                        </>
                      ) : (
                        <>
                          <Share2 className="h-4 w-4 text-indigo-400" /> SHARE
                        </>
                      )}
                    </button>
                    {displayTrack.freeDownloadEnabled && (
                      <button 
                        onClick={() => handleFreeDownload(displayTrack, 'Single Beat')}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded font-bold text-sm hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
                      >
                        <Download className="h-4 w-4" /> FREE DOWNLOAD
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedBeatFromStore?.metadata?.tags || (displayTrack as any).tags || ['trap', 'dark', 'nightrunna']).map((tag: string) => (
                      <span key={tag} className="px-3.5 py-1.5 rounded-full border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Waveform Visualizer */}
            <div className="w-full mb-8 cursor-pointer group" onClick={handleWaveformClick}>
              <canvas 
                ref={canvasRef} 
                width={999} 
                height={100} 
                className="w-full h-[100px] group-hover:opacity-90 transition-opacity"
              />
            </div>

            {/* Comments Input */}
            <div className="flex items-center gap-4 mb-12 border-b border-zinc-800 pb-8">
              <div className="h-10 w-10 bg-zinc-800 rounded-full shrink-0 flex items-center justify-center">
                <span className="text-zinc-500 text-sm font-bold">U</span>
              </div>
              <input 
                type="text" 
                placeholder="Write a comment..." 
                className="flex-1 bg-transparent text-white border-none focus:outline-none pb-2 text-sm"
              />
              <span className="text-xs text-zinc-600 font-medium">0/240</span>
              <button className="bg-white text-black px-6 py-2 rounded font-bold text-sm hover:bg-zinc-200 transition-colors">
                SEND
              </button>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-12 border-b border-zinc-800 mb-6">
              <button 
                onClick={() => setActiveTab('RELATED')}
                className={`pb-4 text-xs font-bold tracking-widest ${activeTab === 'RELATED' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                RELATED TRACKS
              </button>
              <button 
                onClick={() => setActiveTab('PACKS')}
                className={`pb-4 text-xs font-bold tracking-widest ${activeTab === 'PACKS' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                BEAT PACKS
              </button>
              <button 
                onClick={() => setActiveTab('COMMENTS')}
                className={`pb-4 text-xs font-bold tracking-widest ${activeTab === 'COMMENTS' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                COMMENTS
              </button>
            </div>

            {/* Beat Packs Table */}
            {activeTab === 'PACKS' && (
              <div className="w-full mb-12">
                <div className="grid grid-cols-12 gap-4 px-4 py-4 text-xs font-bold text-zinc-500 tracking-wider border-b border-zinc-900 mb-2">
                  <div className="col-span-6">PACK TITLE</div>
                  <div className="col-span-2">BEATS</div>
                  <div className="col-span-4 text-right">ACTION</div>
                </div>

                <div className="space-y-1">
                  {beatPacks.length === 0 ? (
                     <div className="text-center py-8 text-zinc-500">No Beat Packs available.</div>
                  ) : (
                    beatPacks.map(pack => (
                      <div key={pack.packId} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-zinc-900/50 rounded-lg group transition-colors">
                        <div className="col-span-6 flex items-center gap-4">
                          <div className="relative h-12 w-12 bg-zinc-800 rounded shrink-0 flex items-center justify-center overflow-hidden">
                            <Box className="w-5 h-5 text-zinc-600" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">{pack.packName}</div>
                            <div className="text-xs text-zinc-500">ID: {pack.packId}</div>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm text-zinc-400 font-medium">
                          {pack.beats.length}
                        </div>
                        <div className="col-span-4 flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleCheckoutClick(pack, 'Beat Pack')}
                            className="text-zinc-400 hover:text-white transition-colors p-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-sm text-white w-16 text-right">${pack.price || '39.99'}</span>
                          {pack.freeDownloadEnabled && (
                            <button 
                              onClick={() => handleFreeDownload(pack, 'Beat Pack')}
                              className="ml-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> FREE
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tracklist Table */}
            {activeTab === 'RELATED' && (
              <div className="w-full">
                <div className="grid grid-cols-12 gap-4 px-4 py-4 text-xs font-bold text-zinc-500 tracking-wider border-b border-zinc-900 mb-2">
                  <div className="col-span-6">TITLE</div>
                  <div className="col-span-2">TIME</div>
                  <div className="col-span-1">BPM</div>
                  <div className="col-span-3">TAGS</div>
                </div>

                <div className="space-y-1">
                  {beats.map(beat => (
                    <div key={beat.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-zinc-900/50 rounded-lg group transition-colors">
                      <div className="col-span-6 flex items-center gap-4">
                        <div className="relative h-12 w-12 bg-zinc-800 rounded shrink-0 flex items-center justify-center overflow-hidden">
                          {getArtworkUrl(beat.files?.artwork) || beat.artworkUrl ? (
                            <img src={getArtworkUrl(beat.files?.artwork) || beat.artworkUrl!} alt="Artwork" className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-5 h-5 text-zinc-600" />
                          )}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                if (currentTrack?.id === beat.id) {
                                  togglePlayPause();
                                } else {
                                  playTrack({
                                    id: beat.id,
                                    title: beat.title,
                                    producer: beat.metadata.producer || 'NightRunna',
                                    price: beat.price
                                  });
                                }
                              }}
                            >
                              {currentTrack?.id === beat.id && isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-0.5" />}
                            </button>
                          </div>
                        </div>
                        <span className="font-bold text-zinc-200 truncate">{beat.title}</span>
                      </div>
                      <div className="col-span-2 text-sm text-zinc-400 font-mono">03:15</div>
                      <div className="col-span-1 text-sm text-zinc-400 font-mono">{beat.metadata.bpm || '140'}</div>
                      <div className="col-span-3 flex items-center justify-between gap-3">
                        <div className="hidden lg:flex gap-2">
                          {['rap', 'trap'].map(t => (
                            <span key={t} className="px-3 py-1 bg-[#1a1a1c] rounded-full text-xs text-zinc-400 font-medium">{t}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="text-zinc-500 hover:text-white transition-colors">
                            <Share2 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleCheckoutClick(beat, 'Single Beat')}
                            className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <ShoppingCart className="h-4 w-4" /> {beat.price ? `$${beat.price}` : '$39.99'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {beats.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                      Upload beats in the Studio to see them here.
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'COMMENTS' && (
              <div className="text-center py-12 text-zinc-500">
                No comments yet. Be the first to comment!
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-32 border border-zinc-800 rounded-2xl bg-zinc-900/50 mt-12">
            <h3 className="text-2xl font-bold text-white mb-3">No Beats Found</h3>
            <p className="text-zinc-400 max-w-sm">
              Upload your first beat in the Studio to unlock this player view and see the waveform visualizer.
            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        track={displayTrack ? {
          id: displayTrack.id,
          title: displayTrack.title,
          producer: displayTrack.producer,
          artwork: getArtworkUrl(displayTrack.artwork),
          tags: selectedBeatFromStore?.metadata?.tags || (displayTrack as any).tags,
          genre: selectedBeatFromStore?.metadata?.genre,
          price: displayTrack.price?.toString()
        } : null}
      />
    </div>
  );
}
