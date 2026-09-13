import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { useStore } from './StoreContext';

export interface Track {
  id: string;
  title: string;
  producer: string;
  artwork?: string | null;
  audioUrl?: string | null;
  price?: number | string;
  freeDownloadEnabled?: boolean;
  freeDownloadFile?: any;
  tags?: string[];
  genre?: string;
  bpm?: string;
}

export type PlaylistMode = 'newest' | 'oldest' | 'shuffle' | 'custom';
export type LoopMode = 'off' | 'track' | 'playlist';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playlistMode: PlaylistMode;
  loopMode: LoopMode;
  isShuffle: boolean;
  activeQueue: Track[];
  playlistName: string;
  playTrack: (track: Track, customQueue?: Track[]) => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  setPlaylistMode: (mode: PlaylistMode) => void;
  setLoopMode: (mode: LoopMode) => void;
  toggleShuffle: () => void;
  playNext: () => void;
  playPrev: () => void;
  rewind: (seconds?: number) => void;
  stepForward: (seconds?: number) => void;
  getAnalyser?: () => AnalyserNode | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { beats, recordPlay } = useStore();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playlistMode, setPlaylistModeState] = useState<PlaylistMode>('newest');
  const [loopMode, setLoopMode] = useState<LoopMode>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [customQueue, setCustomQueue] = useState<Track[] | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isEngineInitialized = useRef(false);

  // Compute active queue based on store beats or custom queue
  const activeQueue: Track[] = React.useMemo(() => {
    if (customQueue && customQueue.length > 0) return customQueue;
    if (!beats || beats.length === 0) return [];
    
    const formattedBeats: Track[] = beats.map(b => {
      let artworkUrlStr: string | null = null;
      if (typeof b.artworkUrl === 'string') {
        artworkUrlStr = b.artworkUrl;
      } else if (b.files?.artwork) {
        if (typeof b.files.artwork === 'string') artworkUrlStr = b.files.artwork;
        else if (b.files.artwork instanceof Blob || b.files.artwork instanceof File) {
          try { artworkUrlStr = URL.createObjectURL(b.files.artwork); } catch {}
        }
      }

      let audioUrlStr: string | null = null;
      if (typeof b.audioUrl === 'string') {
        audioUrlStr = b.audioUrl;
      } else if (b.files?.wav || b.files?.mp3 || b.files?.taggedAudio) {
        const file = b.files?.wav || b.files?.mp3 || b.files?.taggedAudio;
        if (typeof file === 'string') audioUrlStr = file;
        else if (file instanceof Blob || file instanceof File) {
          try { audioUrlStr = URL.createObjectURL(file); } catch {}
        }
      }

      return {
        id: b.id,
        title: b.title,
        producer: b.producer || b.metadata?.producer || 'NightRunna',
        artwork: artworkUrlStr,
        audioUrl: audioUrlStr,
        price: b.price,
        freeDownloadEnabled: b.freeDownloadEnabled,
        freeDownloadFile: b.freeDownloadFile || b.files?.freeDownload || b.files?.wav || b.files?.mp3,
        tags: b.metadata?.tags,
        genre: b.metadata?.genre,
        bpm: b.metadata?.bpm
      };
    });

    if (playlistMode === 'oldest') {
      return [...formattedBeats].reverse();
    }
    if (playlistMode === 'shuffle' || isShuffle) {
      return [...formattedBeats].sort(() => Math.random() - 0.5);
    }
    // Default 'newest'
    return formattedBeats;
  }, [beats, customQueue, playlistMode, isShuffle]);

  // Keep currentTrack initialized and updated when queue changes
  useEffect(() => {
    if (!currentTrack && activeQueue.length > 0) {
      setCurrentTrack(activeQueue[0]);
    } else if (currentTrack && activeQueue.length > 0) {
      const updated = activeQueue.find(t => t.id === currentTrack.id);
      if (updated) {
        if (
          updated.audioUrl !== currentTrack.audioUrl || 
          updated.artwork !== currentTrack.artwork ||
          updated.freeDownloadEnabled !== currentTrack.freeDownloadEnabled
        ) {
          setCurrentTrack(updated);
        }
      }
    }
  }, [activeQueue, currentTrack]);

  const playlistName = React.useMemo(() => {
    if (customQueue) return 'Custom Selection';
    if (playlistMode === 'oldest') return 'Oldest Beats';
    if (playlistMode === 'shuffle' || isShuffle) return 'Shuffle Play';
    return 'Newest Beats';
  }, [customQueue, playlistMode, isShuffle]);

  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const updateTime = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.pause();
    };
  }, []);

  // Handle track ending with loop / shuffle logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (loopMode === 'track') {
        audio.currentTime = 0;
        audio.play().catch(e => console.error("Loop failed:", e));
      } else {
        playNext();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [loopMode, activeQueue, currentTrack]);

  const initAudioEngine = () => {
    if (isEngineInitialized.current || !audioRef.current) return;
    isEngineInitialized.current = true;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -3;
      compressor.knee.value = 10;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      const gain = ctx.createGain();
      gain.gain.value = 1.3;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(compressor);
      compressor.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (err) {
      console.warn("Web Audio API initialization error:", err);
    }
  };

  const resumeAudioContext = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  useEffect(() => {
    if (audioRef.current && currentTrack?.audioUrl) {
      if (audioRef.current.src !== currentTrack.audioUrl) {
        audioRef.current.src = currentTrack.audioUrl;
        audioRef.current.load();
      }
      if (isPlaying) {
        initAudioEngine();
        resumeAudioContext();
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = (track: Track, newCustomQueue?: Track[]) => {
    if (newCustomQueue) {
      setCustomQueue(newCustomQueue);
    }
    initAudioEngine();
    resumeAudioContext();
    if (currentTrack?.id === track.id) {
      setIsPlaying(true);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
      if (track.id) {
        recordPlay(track.id, track.id.startsWith('NR-BP') ? 'Beat Pack' : 'Single Beat');
      }
    }
  };

  const togglePlayPause = () => {
    initAudioEngine();
    resumeAudioContext();
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(Math.max(0, Math.min(1, vol)));
  };

  const setPlaylistMode = (mode: PlaylistMode) => {
    setPlaylistModeState(mode);
    setCustomQueue(null);
    if (mode === 'shuffle') setIsShuffle(true);
    else setIsShuffle(false);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
    if (!isShuffle) {
      setPlaylistModeState('shuffle');
    }
  };

  const playNext = () => {
    if (activeQueue.length === 0) return;
    if (!currentTrack) {
      playTrack(activeQueue[0]);
      return;
    }
    const idx = activeQueue.findIndex(t => t.id === currentTrack.id);
    if (idx === -1 || idx === activeQueue.length - 1) {
      if (loopMode === 'playlist') {
        playTrack(activeQueue[0]);
      } else {
        setIsPlaying(false);
      }
    } else {
      playTrack(activeQueue[idx + 1]);
    }
  };

  const playPrev = () => {
    if (activeQueue.length === 0) return;
    if (!currentTrack) {
      playTrack(activeQueue[0]);
      return;
    }
    const idx = activeQueue.findIndex(t => t.id === currentTrack.id);
    if (idx <= 0) {
      playTrack(activeQueue[activeQueue.length - 1]);
    } else {
      playTrack(activeQueue[idx - 1]);
    }
  };

  const rewind = (seconds: number = 5) => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - seconds);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const stepForward = (seconds: number = 5) => {
    if (audioRef.current) {
      const newTime = Math.min(duration, audioRef.current.currentTime + seconds);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const getAnalyser = () => analyserRef.current;

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, isPlaying, progress, duration, volume, 
      playlistMode, loopMode, isShuffle, activeQueue, playlistName,
      playTrack, togglePlayPause, seek, setVolume, setPlaylistMode,
      setLoopMode, toggleShuffle, playNext, playPrev, rewind, stepForward,
      getAnalyser
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
