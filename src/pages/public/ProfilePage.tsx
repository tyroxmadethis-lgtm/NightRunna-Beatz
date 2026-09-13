import React from 'react';
import { 
  Headphones, UserPlus, UserCheck, Music, Video, Image as ImageIcon, 
  MapPin, Calendar, ExternalLink, CheckCircle2, Flame, Award, Heart
} from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { 
    isFollowing, 
    followerCount, 
    toggleFollow, 
    beats, 
    videos, 
    photos, 
    recordView 
  } = useStore();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();

  React.useEffect(() => {
    recordView(undefined, 'Storefront');
  }, []);

  const publishedVideos = React.useMemo(() => videos.filter(v => v.published), [videos]);
  const publishedPhotos = React.useMemo(() => photos.filter(p => p.published), [photos]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Cover Banner */}
      <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-zinc-900 border border-zinc-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-25 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
      </div>

      {/* Profile Header Info */}
      <div className="relative -mt-20 px-4 sm:px-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-2xl ring-4 ring-zinc-950">
            <div className="h-full w-full rounded-xl bg-zinc-900 flex items-center justify-center overflow-hidden">
              <Headphones className="h-16 w-16 text-indigo-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-1.5 rounded-full ring-2 ring-zinc-950">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">NightRunna</h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-indigo-500/20">
                PRODUCER
              </span>
            </div>
            <p className="text-zinc-400 text-sm sm:text-base font-medium">
              Multi-Genre Sound Architect & Music Producer
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Los Angeles, CA
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Joined 2026
              </span>
              <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                <Flame className="h-3.5 w-3.5" /> Verified Creator
              </span>
            </div>
          </div>
        </div>

        {/* Follow Button & Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Follower Count Display */}
          <div className="flex items-center gap-6 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-center">
            <div>
              <div className="text-lg font-bold text-white">{followerCount}</div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                {followerCount === 1 ? 'Follower' : 'Followers'}
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div>
              <div className="text-lg font-bold text-white">{beats.length}</div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Beats</div>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={toggleFollow}
            className={`w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] shadow-lg ${
              isFollowing
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 ring-1 ring-zinc-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="h-4 w-4 text-indigo-400" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bio & Socials Section */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">About NightRunna</h2>
        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
          Crafting dark synthwave, atmospheric trap, melodic drill, and high-octane cinematic beats for recording artists, game developers, and film productions. Over 10+ years in sound design, audio engineering, and custom music production.
        </p>
        
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-red-400" /> YouTube <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-pink-400" /> Instagram <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
          <a href="https://soundcloud.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5">
            <Music className="h-3.5 w-3.5 text-amber-400" /> SoundCloud <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Latest Catalog Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Music className="h-5 w-5 text-indigo-400" /> Producer Catalog
          </h2>
          <Link to="/collections" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            Explore All
          </Link>
        </div>

        {beats.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-xl">
            <Music className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No beats uploaded to the public storefront yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {beats.slice(0, 6).map((beat) => (
              <div key={beat.id} className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-12 w-12 rounded-lg bg-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {beat.artworkUrl ? (
                      <img src={beat.artworkUrl} alt={beat.title} className="h-full w-full object-cover" />
                    ) : (
                      <Music className="h-6 w-6 text-indigo-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <h3 className="font-semibold text-white text-sm truncate">{beat.title}</h3>
                    <p className="text-xs text-zinc-400 truncate">{beat.genre || 'Instrumental'} • {beat.bpm || '120'} BPM</p>
                  </div>
                </div>
                <button
                  onClick={() => playTrack({
                    id: beat.id,
                    title: beat.title,
                    producer: 'NightRunna',
                    price: 29.99
                  })}
                  className="p-2.5 rounded-full bg-indigo-600/90 text-white hover:bg-indigo-500 transition-colors flex-shrink-0 ml-2"
                >
                  <Music className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Media Showcase (Videos & Photos) */}
      {(publishedVideos.length > 0 || publishedPhotos.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {publishedVideos.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-red-400" /> Recent Studio Videos
                </h3>
                <Link to="/videos" className="text-xs text-indigo-400 hover:text-indigo-300">View All</Link>
              </div>
              <div className="space-y-3">
                {publishedVideos.slice(0, 2).map((vid) => (
                  <div key={vid.id} className="flex gap-3 items-center">
                    <img src={vid.thumbnailUrl} alt={vid.title} className="h-16 w-24 object-cover rounded-lg border border-zinc-800 flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-white text-xs truncate">{vid.title}</p>
                      <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{vid.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {publishedPhotos.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-purple-400" /> Photography Gallery
                </h3>
                <Link to="/photos" className="text-xs text-indigo-400 hover:text-indigo-300">View All</Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {publishedPhotos.slice(0, 3).map((ph) => (
                  <img key={ph.id} src={ph.imageUrl} alt={ph.title} className="aspect-square object-cover rounded-lg border border-zinc-800" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
