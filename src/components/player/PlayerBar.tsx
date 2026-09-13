import React, { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, ShoppingCart, RotateCcw, RotateCw, ListMusic, 
  ChevronDown, X, Sparkles, Music, Share2, Download, Check
} from 'lucide-react';
import { usePlayer, PlaylistMode } from '../../contexts/PlayerContext';
import { useStore } from '../../contexts/StoreContext';
import { ShareModal } from '../ShareModal';

const formatTime = (time: number) => {
  if (isNaN(time)) return '0:00';
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function PlayerBar() {
  const { recordDownload } = useStore();
  const { 
    currentTrack, isPlaying, togglePlayPause, progress, duration, volume, seek, setVolume,
    playlistMode, setPlaylistMode, loopMode, setLoopMode, isShuffle, toggleShuffle,
    playNext, playPrev, rewind, stepForward, activeQueue, playlistName, playTrack
  } = usePlayer();

  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!currentTrack) return null;

  const handleShare = async () => {
    if (!currentTrack) return;
    const shareUrl = `${window.location.origin}/audio-player/${currentTrack.id}`;
    const shareData = {
      title: `${currentTrack.title} - NightRunna`,
      text: `Check out "${currentTrack.title}" produced by ${currentTrack.producer || 'NightRunna'}!`,
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

  const handleFreeDownload = () => {
    if (!currentTrack) return;
    recordDownload({
      productId: currentTrack.id,
      productTitle: currentTrack.title,
      productType: 'Single Beat',
      type: 'Free'
    });

    const file = currentTrack.freeDownloadFile || currentTrack.audioUrl;
    if (!file) {
      alert("Free download started!");
      return;
    }
    const downloadUrl = typeof file === 'string' ? file : URL.createObjectURL(file);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = typeof file === 'string' ? `${currentTrack.title || 'beat'}.mp3` : file.name;
    document.body.appendChild(a);
    a.click();
    if (typeof file !== 'string') {
      window.URL.revokeObjectURL(downloadUrl);
    }
  };

  const cycleLoopMode = () => {
    if (loopMode === 'off') setLoopMode('playlist');
    else if (loopMode === 'playlist') setLoopMode('track');
    else setLoopMode('off');
  };

  return (
    <>
      {/* QUEUE DRAWER POPUP */}
      {showQueueDrawer && (
        <div className="fixed bottom-24 right-4 sm:right-8 w-80 sm:w-96 max-h-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Playlist Queue ({activeQueue.length})
              </span>
            </div>
            <button 
              onClick={() => setShowQueueDrawer(false)}
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/50 p-1.5 gap-1 text-[11px] font-bold">
            <button
              onClick={() => setPlaylistMode('newest')}
              className={`flex-1 py-1 px-2 rounded-md transition-all ${
                playlistMode === 'newest' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Newest Beats
            </button>
            <button
              onClick={() => setPlaylistMode('oldest')}
              className={`flex-1 py-1 px-2 rounded-md transition-all ${
                playlistMode === 'oldest' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Oldest Beats
            </button>
            <button
              onClick={() => setPlaylistMode('shuffle')}
              className={`flex-1 py-1 px-2 rounded-md transition-all ${
                playlistMode === 'shuffle' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Shuffle Play
            </button>
          </div>

          {/* Queue Items */}
          <div className="overflow-y-auto divide-y divide-zinc-800/60 p-1 max-h-64">
            {activeQueue.map((track, idx) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track)}
                  className={`p-2 rounded-lg flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                    isActive ? 'bg-indigo-600/20 text-white font-bold border border-indigo-500/30' : 'text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-zinc-500 w-4 shrink-0 text-center">
                      {isActive ? '▶' : idx + 1}
                    </span>
                    {track.artwork ? (
                      <img src={track.artwork} alt={track.title} className="w-7 h-7 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 text-[10px] font-bold shrink-0">
                        {track.title.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{track.title}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{track.producer}</p>
                    </div>
                  </div>
                  {track.price && (
                    <span className="text-[10px] text-indigo-400 font-mono shrink-0">${track.price}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BOTTOM AUDIO PLAYER BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-lg z-50 flex items-center px-3 sm:px-6">
        {/* Left: Track Info & Playlist Switcher */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          <div className="h-11 w-11 bg-zinc-800 rounded-lg flex-shrink-0 overflow-hidden relative border border-zinc-700">
            {currentTrack.artwork ? (
              <img src={currentTrack.artwork} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-900/40 text-indigo-400 font-bold text-lg">
                {currentTrack.title.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="min-w-0 truncate">
            <h4 className="font-bold text-sm text-zinc-100 truncate">{currentTrack.title}</h4>
            <div className="relative inline-block">
              <button
                onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer truncate"
              >
                <span>Playlist: {playlistName}</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>

              {/* Playlist Selection Menu Dropdown */}
              {showPlaylistMenu && (
                <div className="absolute bottom-6 left-0 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 text-xs font-bold text-zinc-300">
                  <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-mono border-b border-zinc-800">
                    Select Playlist
                  </div>
                  <button
                    onClick={() => { setPlaylistMode('newest'); setShowPlaylistMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                      playlistMode === 'newest' ? 'text-indigo-400 font-extrabold bg-indigo-600/10' : ''
                    }`}
                  >
                    <span>🆕 Newest Beats</span>
                  </button>
                  <button
                    onClick={() => { setPlaylistMode('oldest'); setShowPlaylistMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                      playlistMode === 'oldest' ? 'text-indigo-400 font-extrabold bg-indigo-600/10' : ''
                    }`}
                  >
                    <span>📜 Oldest Beats</span>
                  </button>
                  <button
                    onClick={() => { setPlaylistMode('shuffle'); setShowPlaylistMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                      playlistMode === 'shuffle' ? 'text-indigo-400 font-extrabold bg-indigo-600/10' : ''
                    }`}
                  >
                    <span>🔀 Shuffle Play</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Playback Controls & Scrubber */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-2">
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Shuffle Toggle */}
            <button 
              onClick={toggleShuffle}
              title={isShuffle ? 'Shuffle Active' : 'Enable Shuffle Play'}
              className={`p-1.5 rounded-lg transition-all hidden sm:block ${
                isShuffle ? 'text-indigo-400 bg-indigo-600/20' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shuffle className="h-4 w-4" />
            </button>

            {/* Rewind (-5s) */}
            <button 
              onClick={() => rewind(5)}
              title="Rewind 5s"
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Previous Track */}
            <button 
              onClick={playPrev}
              title="Previous Beat"
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            {/* Play / Pause Button */}
            <button 
              onClick={togglePlayPause}
              className="h-10 w-10 bg-white text-zinc-950 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md shrink-0"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>

            {/* Next Track */}
            <button 
              onClick={playNext}
              title="Next Beat"
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            {/* Step Forward (+5s) */}
            <button 
              onClick={() => stepForward(5)}
              title="Step Forward 5s"
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Loop / Repeat Toggle */}
            <button 
              onClick={cycleLoopMode}
              title={`Loop Mode: ${loopMode}`}
              className={`p-1.5 rounded-lg transition-all relative hidden sm:block ${
                loopMode !== 'off' ? 'text-indigo-400 bg-indigo-600/20' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Repeat className="h-4 w-4" />
              {loopMode === 'track' && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Progress Scrubber */}
          <div className="w-full flex items-center gap-2 mt-1.5 hidden sm:flex">
            <span className="text-[10px] text-zinc-500 font-mono w-8 text-right shrink-0">{formatTime(progress)}</span>
            <div 
              className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seek(percent * duration);
              }}
            >
              <div 
                className="h-full bg-indigo-500 group-hover:bg-indigo-400 relative transition-all duration-75"
                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow"></div>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono w-8 shrink-0">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Actions, Queue Drawer Toggle & Volume */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/3">
          {/* Share Button */}
          <button
            onClick={handleShare}
            title={copiedShare ? "Link Copied to Clipboard!" : "Share Beat"}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-all flex items-center justify-center cursor-pointer"
          >
            {copiedShare ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          </button>

          {/* Free Download Button (if enabled) */}
          {currentTrack.freeDownloadEnabled && (
            <button
              onClick={handleFreeDownload}
              title="Free Download"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-lg shadow-emerald-900/20 shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Free</span>
            </button>
          )}

          {currentTrack.price && (
            <button className="hidden lg:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow">
              <ShoppingCart className="h-3 w-3" />
              ${currentTrack.price}
            </button>
          )}

          {/* Queue Drawer Button */}
          <button
            onClick={() => setShowQueueDrawer(!showQueueDrawer)}
            title="Open Playlist Queue"
            className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              showQueueDrawer 
                ? 'bg-indigo-600 text-white border-indigo-500' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <ListMusic className="h-4 w-4" />
            <span className="hidden xl:inline">Queue</span>
          </button>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2 w-24">
            <button onClick={() => setVolume(volume === 0 ? 1 : 0)}>
              {volume === 0 ? <VolumeX className="h-4 w-4 text-zinc-400 hover:text-white" /> : <Volume2 className="h-4 w-4 text-zinc-400 hover:text-white" />}
            </button>
            <div 
              className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                setVolume(percent);
              }}
            >
              <div 
                className="h-full bg-zinc-400 group-hover:bg-indigo-400"
                style={{ width: `${volume * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        track={{
          id: currentTrack.id,
          title: currentTrack.title,
          producer: currentTrack.producer,
          artwork: currentTrack.artwork,
          tags: currentTrack.tags,
          genre: currentTrack.genre,
          price: currentTrack.price?.toString()
        }}
      />
    </>
  );
}

