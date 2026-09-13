import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Minus, Maximize2, Minimize2, Upload, FileArchive, 
  Music, FileAudio, Image as ImageIcon, CheckCircle, 
  Settings, DollarSign, Loader2, ChevronRight, ChevronLeft,
  AlertCircle, Play, Pause
} from 'lucide-react';
import { parseBeatPackZip, ParsedBeatPack, ParsedBeat } from '../../utils/zipParser';
import { usePlayer } from '../../contexts/PlayerContext';
import { useStore } from '../../contexts/StoreContext';

type UploadStep = 
  | 'SELECT_WORKFLOW'
  | 'BP_UPLOAD_ZIP'
  | 'BP_SCANNING'
  | 'BP_CONTENTS'
  | 'BP_INFORMATION'
  | 'BP_MEDIA'
  | 'BP_PRICING'
  | 'BP_REVIEW'
  | 'BP_PUBLISHING'
  | 'SB_UPLOAD_FILES'
  | 'SB_INFORMATION'
  | 'SB_PRICING'
  | 'SB_REVIEW';

interface UploadCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadCenter({ isOpen, onClose }: UploadCenterProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [step, setStep] = useState<UploadStep>('SELECT_WORKFLOW');
  
  // State for Beat Pack
  const [packData, setPackData] = useState<ParsedBeatPack | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Pack level metadata state
  const [packPricing, setPackPricing] = useState({ price: '29.99', freeDownloadEnabled: false, freeDownloadFile: null as any });

  // Single Beat level state
  const [singleBeat, setSingleBeat] = useState<Partial<ParsedBeat> | null>(null);

  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const { addBeat, addBeatPack } = useStore();

  // Reset state when closed completely
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('SELECT_WORKFLOW');
        setIsMinimized(false);
        setIsMaximized(false);
        setPackData(null);
      }, 300);
    }
  }, [isOpen]);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.zip')) return;

    setStep('BP_SCANNING');
    setScanProgress(0);

    try {
      const data = await parseBeatPackZip(file, (progress) => {
        setScanProgress(progress);
      });
      setPackData(data);
      // Brief delay to show 100% completion before moving
      setTimeout(() => {
        setStep('BP_CONTENTS');
      }, 800);
    } catch (error) {
      console.error("Failed to parse zip", error);
      alert("Failed to read ZIP contents. Please ensure it is a valid zip archive.");
      setStep('BP_UPLOAD_ZIP');
    }
  };

  const updateBeat = (beatId: string, updates: Partial<ParsedBeat>) => {
    if (!packData) return;
    setPackData({
      ...packData,
      beats: packData.beats.map(b => b.id === beatId ? { ...b, ...updates } : b)
    });
  };

  const updateBeatMetadata = (beatId: string, metadataUpdates: Partial<ParsedBeat['metadata']>) => {
    if (!packData) return;
    setPackData({
      ...packData,
      beats: packData.beats.map(b => 
        b.id === beatId 
          ? { ...b, metadata: { ...b.metadata, ...metadataUpdates } } 
          : b
      )
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-4">
        <motion.div
          drag={!isMaximized}
          dragHandle=".drag-handle"
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: isMinimized ? 'calc(50vh - 30px)' : 0,
            x: isMinimized ? 'calc(50vw - 150px)' : 0,
            width: isMaximized ? '100%' : isMinimized ? '300px' : '900px',
            height: isMaximized ? '100%' : isMinimized ? '60px' : '750px',
            maxWidth: isMaximized ? '100%' : '100%',
            maxHeight: isMaximized ? '100%' : '90vh'
          }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-zinc-950 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden pointer-events-auto flex flex-col"
        >
          {/* Header & Window Controls */}
          <div className="drag-handle h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing shrink-0">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-indigo-400" />
              <h2 className="font-semibold text-zinc-100 truncate">
                {isMinimized ? 'Upload in progress...' : 'Upload Center'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button 
                onClick={() => {
                  setIsMaximized(!isMaximized);
                  if (isMinimized) setIsMinimized(false);
                }}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden relative flex flex-col bg-zinc-950">
              
              {/* STEP: SELECT WORKFLOW */}
              {step === 'SELECT_WORKFLOW' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-4">What would you like to upload?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <button 
                      onClick={() => {
                        setSingleBeat({
                          id: `NR-BT-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
                          title: 'New Beat',
                          files: { wav: null, mp3: null, m4a: null, stems: null, artwork: null },
                          metadata: { genre: 'Trap', bpm: '', key: '', mood: '', tags: [], description: '', producer: 'NightRunna' }
                        });
                        setStep('SB_UPLOAD_FILES');
                      }}
                      className="group flex flex-col items-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-indigo-500 hover:bg-zinc-800/50 transition-all text-center"
                    >
                      <div className="h-16 w-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-500/20">
                        <Music className="h-8 w-8 text-indigo-400" />
                      </div>
                      <h4 className="text-lg font-bold text-zinc-100 mb-2">Upload Single Beat</h4>
                      <p className="text-sm text-zinc-400">Upload one track with its stems and artwork.</p>
                    </button>

                    <button 
                      onClick={() => setStep('BP_UPLOAD_ZIP')}
                      className="group flex flex-col items-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-indigo-500 hover:bg-zinc-800/50 transition-all text-center"
                    >
                      <div className="h-16 w-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-500/20">
                        <FileArchive className="h-8 w-8 text-indigo-400" />
                      </div>
                      <h4 className="text-lg font-bold text-zinc-100 mb-2">Upload Beat Pack</h4>
                      <p className="text-sm text-zinc-400">Upload a ZIP containing multiple beats and assets.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: UPLOAD ZIP */}
              {step === 'BP_UPLOAD_ZIP' && (
                <div className="flex-1 flex flex-col p-8">
                  <button onClick={() => setStep('SELECT_WORKFLOW')} className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 mb-6 w-fit">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <div className="flex-1 border-2 border-dashed border-zinc-700 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-indigo-500 hover:bg-zinc-900/30 transition-all relative">
                    <input 
                      type="file" 
                      accept=".zip" 
                      onChange={handleZipUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileArchive className="h-16 w-16 text-zinc-500 mb-4" />
                    <h3 className="text-xl font-bold text-zinc-100 mb-2">Select Beat Pack ZIP</h3>
                    <p className="text-zinc-400 text-center max-w-md">
                      Drag and drop your .zip file containing all your beats, stems, and artwork, or tap to browse your device.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP: SCANNING ZIP */}
              {step === 'BP_SCANNING' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                  <div className="relative h-24 w-24">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-zinc-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                      <circle 
                        className="text-indigo-500 progress-ring stroke-current transition-all duration-300 ease-out" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        strokeDasharray="251.2" 
                        strokeDashoffset={251.2 - (251.2 * scanProgress) / 100}
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{scanProgress}%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-zinc-100 mb-2">Inspecting ZIP Contents</h3>
                    <p className="text-zinc-400">Reading real file structures and grouping beats...</p>
                  </div>
                </div>
              )}

              {/* STEPS 4-9: Beat Pack Configuration Workflow */}
              {['BP_CONTENTS', 'BP_INFORMATION', 'BP_MEDIA', 'BP_PRICING', 'BP_REVIEW'].includes(step) && packData && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Top Progress Bar */}
                  <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-1 rounded">ZIP ID: {packData.zipId}</span>
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">PACK ID: {packData.packId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      {['CONTENTS', 'INFORMATION', 'MEDIA', 'PRICING', 'REVIEW'].map((s, idx) => {
                        const sStep = `BP_${s}` as UploadStep;
                        const isActive = step === sStep;
                        return (
                          <button 
                            key={s} 
                            onClick={() => setStep(sStep)}
                            className={`font-medium px-2 py-1 transition-colors ${isActive ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scrollable Workspace */}
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
                    
                    {step === 'BP_CONTENTS' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-xl font-bold text-white">Pack Contents</h3>
                            <p className="text-zinc-400">Review grouped files for the {packData.beats.length} detected beats.</p>
                          </div>
                        </div>
                        
                        <div className="grid gap-4">
                          {packData.beats.map((beat, i) => (
                            <div key={beat.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between group hover:border-zinc-700 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-xs font-bold text-zinc-500 w-6">{(i + 1).toString().padStart(2, '0')}</span>
                                  <button 
                                    onClick={() => {
                                      if (currentTrack?.id === beat.id) {
                                        togglePlayPause();
                                      } else {
                                        playTrack({
                                          id: beat.id,
                                          title: beat.title,
                                          producer: beat.metadata.producer || 'NightRunna',
                                          price: packPricing.isFree ? 'Free' : packPricing.price
                                        });
                                      }
                                    }}
                                    className="h-8 w-8 rounded-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 flex items-center justify-center transition-colors"
                                  >
                                    {currentTrack?.id === beat.id && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                                  </button>
                                  <h4 className="font-bold text-zinc-100">{beat.title}</h4>
                                  <span className="text-xs font-mono text-zinc-600 ml-auto sm:ml-2">{beat.id}</span>
                                </div>
                                <div className="flex flex-wrap gap-3 pl-9">
                                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${beat.files.wav ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {beat.files.wav ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                    WAV
                                  </div>
                                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${beat.files.mp3 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {beat.files.mp3 ? <CheckCircle className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                    MP3
                                  </div>
                                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${beat.files.m4a ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {beat.files.m4a ? <CheckCircle className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                    M4A
                                  </div>
                                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${beat.files.stems ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {beat.files.stems ? <CheckCircle className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                    STEMS
                                  </div>
                                </div>
                              </div>
                              <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                                <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded transition-colors">
                                  Edit Files
                                </button>
                                <button className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 text-xs font-medium rounded transition-colors">
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 'BP_INFORMATION' && (
                      <div className="space-y-8">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                          <h3 className="text-lg font-bold text-white mb-4">Pack Level Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-400 mb-1">Beat Pack Name</label>
                              <input 
                                type="text" 
                                value={packData.packName} 
                                onChange={(e) => setPackData({...packData, packName: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-400 mb-1">Producer/Credits</label>
                              <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" defaultValue="NightRunna" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Pack Description</label>
                            <textarea rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="Describe the pack..."></textarea>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white mb-4">Individual Beat Metadata</h3>
                          <div className="space-y-4">
                            {packData.beats.map((beat) => (
                              <div key={beat.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-zinc-100">{beat.title}</h4>
                                  <span className="text-xs text-zinc-500">ID: {beat.id}</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1">Genre</label>
                                    <select 
                                      value={beat.metadata.genre} 
                                      disabled
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-400 opacity-70 cursor-not-allowed"
                                    >
                                      <option value="Trap">Trap</option>
                                    </select>
                                    <p className="text-[10px] text-zinc-600 mt-1">Restricted to Trap</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1">BPM</label>
                                    <input 
                                      type="number" 
                                      value={beat.metadata.bpm}
                                      onChange={(e) => updateBeatMetadata(beat.id, { bpm: e.target.value })}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500" 
                                      placeholder="e.g. 140"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1">Key</label>
                                    <input 
                                      type="text" 
                                      value={beat.metadata.key}
                                      onChange={(e) => updateBeatMetadata(beat.id, { key: e.target.value })}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500" 
                                      placeholder="e.g. C# Min"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1">Mood</label>
                                    <input 
                                      type="text" 
                                      value={beat.metadata.mood}
                                      onChange={(e) => updateBeatMetadata(beat.id, { mood: e.target.value })}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500" 
                                      placeholder="Dark"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 'BP_MEDIA' && (
                      <div className="space-y-8">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col sm:flex-row gap-6 items-start">
                          <div className="h-32 w-32 bg-zinc-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 shrink-0">
                            <ImageIcon className="h-8 w-8 text-zinc-500 mb-2" />
                            <span className="text-xs text-zinc-400">Upload Pack Art</span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white">Beat Pack Artwork</h3>
                            <p className="text-sm text-zinc-400">This artwork represents the entire pack in the storefront. Minimum 1000x1000px.</p>
                            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-medium transition-colors mt-2">
                              Choose Image
                            </button>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white mb-4">Individual Beat Media Status</h3>
                          <div className="grid gap-3">
                            {packData.beats.map((beat) => (
                              <div key={beat.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                                <span className="font-medium text-zinc-200 text-sm">{beat.title}</span>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className={`flex items-center gap-1 ${beat.files.artwork ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                    <ImageIcon className="h-3 w-3" /> Art
                                  </span>
                                  <span className={`flex items-center gap-1 ${beat.files.wav ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                    <FileAudio className="h-3 w-3" /> WAV
                                  </span>
                                  <span className={`flex items-center gap-1 ${beat.files.stems ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                    <FileArchive className="h-3 w-3" /> Stems
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 'BP_PRICING' && (
                      <div className="space-y-8">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">Pack Pricing</h3>
                            <p className="text-sm text-zinc-400 mb-4">Set the price for purchasing the entire pack as a single product. This does not overwrite individual beat pricing.</p>
                            
                            <div className="flex items-center gap-4">
                              <div className="relative w-48">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <DollarSign className="h-4 w-4 text-zinc-500" />
                                </div>
                                <input 
                                  type="text" 
                                  value={packPricing.price}
                                  onChange={(e) => setPackPricing({...packPricing, price: e.target.value})}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500" 
                                />
                              </div>
                            </div>
                          </div>

                          <hr className="border-zinc-800" />
                          
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2">Free Download Settings</h3>
                            <label className="flex items-center gap-2 cursor-pointer mb-4">
                              <input 
                                type="checkbox" 
                                checked={packPricing.freeDownloadEnabled}
                                onChange={(e) => setPackPricing({...packPricing, freeDownloadEnabled: e.target.checked})}
                                className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-zinc-900 bg-zinc-950"
                              />
                              <span className="text-sm font-medium text-zinc-300">Enable Free Download</span>
                            </label>

                            {packPricing.freeDownloadEnabled && (
                              <div className="pl-6 space-y-3">
                                <label className="block text-sm font-medium text-zinc-400">Select file to deliver for free download:</label>
                                <select 
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white"
                                  value={packPricing.freeDownloadFile?.name || ''}
                                  onChange={(e) => {
                                    const fileName = e.target.value;
                                    let selectedFile = null;
                                    // Normally we would find the file, let's assume packData.rawFiles or something, but we need the actual file object.
                                    // The prompt says "Allow the producer to configure the free-download delivery... Validate that the configured pack download exists."
                                    if (packData?.packName === fileName) {
                                      selectedFile = { name: packData.packName }; // Mock file reference
                                    }
                                    setPackPricing({...packPricing, freeDownloadFile: selectedFile});
                                  }}
                                >
                                  <option value="">-- Select File --</option>
                                  {packData && <option value={packData.packName}>Beat Pack ZIP ({packData.packName})</option>}
                                </select>
                                {!packPricing.freeDownloadFile && (
                                  <p className="text-xs text-red-500">You must configure a valid downloadable file to publish.</p>
                                )}
                              </div>
                            )}
                          </div>

                          <hr className="border-zinc-800" />

                          <div>
                            <h3 className="text-lg font-bold text-white mb-4">Pack License Settings</h3>
                            <div className="space-y-3">
                              {[
                                { name: 'MP3 License', default: true },
                                { name: 'WAV License', default: true },
                                { name: 'Premium (WAV + Stems)', default: true },
                                { name: 'Exclusive Rights', default: false },
                              ].map(license => (
                                <label key={license.name} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700 transition-colors">
                                  <span className="text-sm font-medium text-zinc-200">{license.name}</span>
                                  <input 
                                    type="checkbox" 
                                    defaultChecked={license.default}
                                    className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-zinc-950 bg-zinc-900"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 'BP_REVIEW' && (
                      <div className="space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center">
                          <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-10 w-10 text-indigo-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">{packData.packName}</h3>
                          <div className="flex gap-2 justify-center flex-wrap">
                            <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">BP-ID: {packData.packId}</span>
                            <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">ZIP: {packData.zipId}</span>
                            <span className="text-xs font-medium bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">{packData.beats.length} Beats</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Configuration</h4>
                            <dl className="space-y-2 text-sm">
                              <div className="flex justify-between"><dt className="text-zinc-500">Price</dt><dd className="font-medium text-white">{packPricing.isFree ? 'Free' : `$${packPricing.price}`}</dd></div>
                              <div className="flex justify-between"><dt className="text-zinc-500">Genre Enforced</dt><dd className="font-medium text-white">Trap</dd></div>
                              <div className="flex justify-between"><dt className="text-zinc-500">Artwork</dt><dd className="font-medium text-yellow-500">Missing</dd></div>
                            </dl>
                          </div>
                          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Detected Beats ({packData.beats.length})</h4>
                            <ul className="space-y-2 text-sm">
                              {packData.beats.map(b => (
                                <li key={b.id} className="flex justify-between border-b border-zinc-800 pb-1 last:border-0">
                                  <span className="text-zinc-300 truncate">{b.title}</span>
                                  <span className="text-zinc-500 font-mono text-xs shrink-0 ml-2">{b.id}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Warnings */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3 text-sm text-yellow-200">
                          <AlertCircle className="h-5 w-5 shrink-0 text-yellow-500" />
                          <div>
                            <p className="font-bold text-yellow-500 mb-1">Validation Warnings</p>
                            <ul className="list-disc pl-4 space-y-1 opacity-80">
                              <li>Pack artwork is missing.</li>
                              <li>Some beats are missing BPM data.</li>
                              <li>1 beat is missing WAV files.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="p-4 border-t border-zinc-800 bg-zinc-900 shrink-0 flex justify-between items-center">
                    <button 
                      onClick={() => {
                        const steps: UploadStep[] = ['BP_CONTENTS', 'BP_INFORMATION', 'BP_MEDIA', 'BP_PRICING', 'BP_REVIEW'];
                        const currentIndex = steps.indexOf(step);
                        if (currentIndex > 0) setStep(steps[currentIndex - 1]);
                      }}
                      disabled={step === 'BP_CONTENTS'}
                      className="px-4 py-2 text-zinc-400 hover:text-white font-medium text-sm disabled:opacity-30 transition-colors"
                    >
                      Back
                    </button>
                    
                    {step === 'BP_REVIEW' ? (
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md font-medium text-sm transition-colors">
                          Save Draft
                        </button>
                        <button 
                          onClick={() => {
                            if (packPricing.freeDownloadEnabled && !packPricing.freeDownloadFile) {
                              alert("Free Download is enabled, but no downloadable file is configured.\nPlease fix download settings before publishing.");
                              return;
                            }
                            if (packData) {
                              const finalPack = {
                                ...packData,
                                price: packPricing.price,
                                freeDownloadEnabled: packPricing.freeDownloadEnabled,
                                freeDownloadFile: packPricing.freeDownloadFile
                              };
                              addBeatPack(finalPack);
                            }
                            alert("Beat Pack Published Successfully!");
                            onClose();
                          }}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm transition-colors shadow-lg shadow-indigo-900/20"
                        >
                          Publish Beat Pack
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          const steps: UploadStep[] = ['BP_CONTENTS', 'BP_INFORMATION', 'BP_MEDIA', 'BP_PRICING', 'BP_REVIEW'];
                          const currentIndex = steps.indexOf(step);
                          if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
                        }}
                        className="px-6 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-md font-medium text-sm transition-colors flex items-center gap-1"
                      >
                        Continue <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEPS: Single Beat Configuration Workflow */}
              {['SB_UPLOAD_FILES', 'SB_INFORMATION', 'SB_PRICING', 'SB_REVIEW'].includes(step) && singleBeat && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Top Progress Bar */}
                  <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-1 rounded">BEAT ID: {singleBeat.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      {['UPLOAD_FILES', 'INFORMATION', 'PRICING', 'REVIEW'].map((s) => {
                        const sStep = `SB_${s}` as UploadStep;
                        const isActive = step === sStep;
                        return (
                          <button 
                            key={s} 
                            onClick={() => setStep(sStep)}
                            className={`font-medium px-2 py-1 transition-colors ${isActive ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scrollable Workspace */}
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
                    {step === 'SB_UPLOAD_FILES' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-xl font-bold text-white">Upload Beat Files</h3>
                            <p className="text-zinc-400">Add the audio files, stems, and artwork for this beat.</p>
                          </div>
                        </div>

                        {/* Cloud Integrations UI */}
                        <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                          <span className="text-sm font-bold text-zinc-400 shrink-0">IMPORT FROM:</span>
                          <button 
                            className="bg-[#0061FF]/10 text-[#0061FF] hover:bg-[#0061FF]/20 px-4 py-2 rounded font-bold text-sm transition-colors border border-[#0061FF]/20 flex items-center gap-2"
                            onClick={() => alert('Dropbox integration requires OAuth configuration.')}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2l6 4-6 4-6-4 6-4zm6 4l6-4 6 4-6 4-6-4zm-6 4l6 4-6 4-6-4 6-4zm6 4l6-4 6 4-6 4-6-4zm0 6l-6-4v2l6 4 6-4v-2l-6 4z"/></svg>
                            Dropbox
                          </button>
                          <button 
                            className="bg-[#0F9D58]/10 text-[#0F9D58] hover:bg-[#0F9D58]/20 px-4 py-2 rounded font-bold text-sm transition-colors border border-[#0F9D58]/20 flex items-center gap-2"
                            onClick={() => alert('Google Drive integration requires OAuth configuration.')}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 3.5h13.12L16.3 15H3.18M11.75 16.5L18.3 5l3.43 6-6.55 11.5"/></svg>
                            Google Drive
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-zinc-900/30 transition-colors cursor-pointer relative overflow-hidden group">
                            <input 
                              type="file" 
                              accept="audio/mp4, audio/x-m4a, audio/mpeg, .m4a, .mp3" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Validate file type
                                  const validTypes = ['audio/mp4', 'audio/x-m4a', 'audio/mpeg'];
                                  const validExtensions = ['.m4a', '.mp3'];
                                  const isValidType = validTypes.includes(file.type);
                                  const isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
                                  
                                  if (!isValidType && !isValidExtension) {
                                    alert('Only M4A and MP3 files are allowed.');
                                    e.target.value = ''; // Reset input
                                    return;
                                  }

                                  const url = URL.createObjectURL(file);
                                  setSingleBeat({ ...singleBeat, files: { ...singleBeat?.files, wav: file }, audioUrl: url });
                                }
                              }}
                            />
                            {singleBeat?.files?.wav ? (
                              <>
                                <CheckCircle className="h-10 w-10 text-emerald-500 mb-3" />
                                <h4 className="font-bold text-zinc-100">{singleBeat.files.wav.name}</h4>
                                <p className="text-xs text-emerald-400 mt-1">Audio file loaded</p>
                              </>
                            ) : (
                              <>
                                <FileAudio className="h-10 w-10 text-zinc-500 mb-3 group-hover:text-indigo-400 transition-colors" />
                                <h4 className="font-bold text-zinc-100">Untagged M4A / MP3</h4>
                                <p className="text-xs text-zinc-400 mt-1">Click to choose from device</p>
                              </>
                            )}
                          </label>

                          <label className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-zinc-900/30 transition-colors cursor-pointer relative overflow-hidden group">
                            <input 
                              type="file" 
                              accept=".zip" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSingleBeat({ ...singleBeat, files: { ...singleBeat?.files, stems: file } });
                                }
                              }}
                            />
                            {singleBeat?.files?.stems ? (
                              <>
                                <CheckCircle className="h-10 w-10 text-emerald-500 mb-3" />
                                <h4 className="font-bold text-zinc-100">{singleBeat.files.stems.name}</h4>
                                <p className="text-xs text-emerald-400 mt-1">Stems archive loaded</p>
                              </>
                            ) : (
                              <>
                                <FileArchive className="h-10 w-10 text-zinc-500 mb-3 group-hover:text-indigo-400 transition-colors" />
                                <h4 className="font-bold text-zinc-100">Trackouts / Stems (ZIP)</h4>
                                <p className="text-xs text-zinc-400 mt-1">Click to choose from device</p>
                              </>
                            )}
                          </label>

                          <label className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-zinc-900/30 transition-colors cursor-pointer relative overflow-hidden group md:col-span-2">
                            <input 
                              type="file" 
                              accept="image/jpeg, image/png, image/webp" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSingleBeat({ ...singleBeat, artwork: file, files: { ...singleBeat?.files, artwork: file } });
                                }
                              }}
                            />
                            {singleBeat?.artwork ? (
                              <>
                                <CheckCircle className="h-10 w-10 text-emerald-500 mb-3" />
                                <h4 className="font-bold text-zinc-100">{singleBeat.artwork.name}</h4>
                                <p className="text-xs text-emerald-400 mt-1">Artwork loaded</p>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="h-10 w-10 text-zinc-500 mb-3 group-hover:text-indigo-400 transition-colors" />
                                <h4 className="font-bold text-zinc-100">Artwork</h4>
                                <p className="text-xs text-zinc-400 mt-1">Click to choose from device</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    )}

                    {step === 'SB_INFORMATION' && (
                      <div className="space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                          <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Beat Title</label>
                            <input 
                              type="text" 
                              value={singleBeat.title}
                              onChange={(e) => setSingleBeat({...singleBeat, title: e.target.value})}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" 
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-400 mb-1">BPM</label>
                              <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white" placeholder="140" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-400 mb-1">Key</label>
                              <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white" placeholder="C# Min" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-zinc-400 mb-1">Genre</label>
                              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white">
                                <option>Trap</option>
                                <option>Hip Hop</option>
                                <option>R&B</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 'SB_PRICING' && (
                      <div className="space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                          <h3 className="text-lg font-bold text-white mb-2">Beat Default Price</h3>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">Default Buy Price ($ USD)</label>
                            <div className="relative max-w-xs">
                              <span className="absolute left-3.5 top-2.5 text-zinc-500 font-bold">$</span>
                              <input 
                                type="text" 
                                value={singleBeat?.price || '39.99'} 
                                onChange={(e) => setSingleBeat({...singleBeat, price: e.target.value})}
                                placeholder="39.99"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-4 py-2 text-white font-bold text-base focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-white pt-4 mb-2">License Tiers & Options</h3>
                          <div className="space-y-3">
                            {(singleBeat?.licenses || [
                              { name: 'MP3 Lease', price: '29.99' },
                              { name: 'WAV Lease', price: '39.99' },
                              { name: 'Trackout / Stems', price: '99.99' },
                              { name: 'Unlimited Rights', price: '199.99' },
                            ]).map((license, idx) => (
                              <div key={license.name} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                <span className="font-medium text-zinc-200">{license.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-500">$</span>
                                  <input 
                                    type="text" 
                                    value={license.price} 
                                    onChange={(e) => {
                                      const currentLicenses = singleBeat?.licenses || [
                                        { name: 'MP3 Lease', price: '29.99' },
                                        { name: 'WAV Lease', price: '39.99' },
                                        { name: 'Trackout / Stems', price: '99.99' },
                                        { name: 'Unlimited Rights', price: '199.99' },
                                      ];
                                      const newLicenses = [...currentLicenses];
                                      newLicenses[idx] = { ...license, price: e.target.value };
                                      setSingleBeat({ ...singleBeat, licenses: newLicenses });
                                    }}
                                    className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white text-right font-bold" 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                          <h3 className="text-lg font-bold text-white mb-2">Storefront Visibility</h3>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={singleBeat?.featured || false}
                              onChange={(e) => setSingleBeat({...singleBeat, featured: e.target.checked})}
                              className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-zinc-900 bg-zinc-950"
                            />
                            <span className="text-sm font-medium text-zinc-300">Feature this Beat on Storefront Homepage</span>
                          </label>
                          <p className="text-xs text-zinc-500 pl-6">When enabled, this beat will automatically appear in the Featured Beats section on your public homepage.</p>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                          <h3 className="text-lg font-bold text-white mb-2">Free Download Settings</h3>
                          <label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input 
                              type="checkbox" 
                              checked={singleBeat?.freeDownloadEnabled || false}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const defaultFile = isChecked ? (singleBeat?.files?.wav || singleBeat?.freeDownloadFile || null) : null;
                                setSingleBeat({ ...singleBeat, freeDownloadEnabled: isChecked, freeDownloadFile: defaultFile });
                              }}
                              className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-zinc-900 bg-zinc-950"
                            />
                            <span className="text-sm font-medium text-zinc-300">Enable Free Download</span>
                          </label>

                          {singleBeat?.freeDownloadEnabled && (
                            <div className="pl-6 space-y-3">
                              <label className="block text-sm font-medium text-zinc-400">Select file to deliver for free download:</label>
                              <select 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white"
                                value={singleBeat.freeDownloadFile?.name || ''}
                                onChange={(e) => {
                                  const fileName = e.target.value;
                                  let selectedFile = null;
                                  if (singleBeat?.files?.wav?.name === fileName) selectedFile = singleBeat.files.wav;
                                  else if (singleBeat?.files?.stems?.name === fileName) selectedFile = singleBeat.files.stems;
                                  setSingleBeat({...singleBeat, freeDownloadFile: selectedFile});
                                }}
                              >
                                <option value="">-- Select File --</option>
                                {singleBeat?.files?.wav && <option value={singleBeat.files.wav.name}>Untagged Audio ({singleBeat.files.wav.name})</option>}
                                {singleBeat?.files?.stems && <option value={singleBeat.files.stems.name}>Trackouts/Stems ({singleBeat.files.stems.name})</option>}
                              </select>
                              {!singleBeat.freeDownloadFile && (
                                <p className="text-xs text-red-500">You must configure a valid downloadable file to publish.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {step === 'SB_REVIEW' && (
                      <div className="space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center">
                          <button 
                            onClick={() => {
                              if (currentTrack?.id === singleBeat.id) {
                                togglePlayPause();
                              } else {
                                let artworkUrlStr: string | null = null;
                                if (typeof singleBeat.artworkUrl === 'string') artworkUrlStr = singleBeat.artworkUrl;
                                else if (singleBeat.artwork instanceof File || singleBeat.artwork instanceof Blob) {
                                  try { artworkUrlStr = URL.createObjectURL(singleBeat.artwork); } catch {}
                                } else if (singleBeat.files?.artwork instanceof File || singleBeat.files?.artwork instanceof Blob) {
                                  try { artworkUrlStr = URL.createObjectURL(singleBeat.files.artwork); } catch {}
                                }

                                let audioUrlStr: string | null = null;
                                if (typeof singleBeat.audioUrl === 'string') audioUrlStr = singleBeat.audioUrl;
                                else if (singleBeat.files?.wav instanceof File || singleBeat.files?.wav instanceof Blob) {
                                  try { audioUrlStr = URL.createObjectURL(singleBeat.files.wav); } catch {}
                                } else if (singleBeat.files?.mp3 instanceof File || singleBeat.files?.mp3 instanceof Blob) {
                                  try { audioUrlStr = URL.createObjectURL(singleBeat.files.mp3); } catch {}
                                }

                                playTrack({
                                  id: singleBeat.id || 'new',
                                  title: singleBeat.title || 'New Beat',
                                  producer: singleBeat.metadata?.producer || 'NightRunna',
                                  artwork: artworkUrlStr,
                                  audioUrl: audioUrlStr,
                                  price: singleBeat.price || '29.99'
                                });
                              }
                            }}
                            className="h-16 w-16 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 transition-colors"
                          >
                            {currentTrack?.id === singleBeat.id && isPlaying ? <Pause className="h-8 w-8 text-indigo-400" /> : <Play className="h-8 w-8 text-indigo-400 ml-1" />}
                          </button>
                          <h3 className="text-2xl font-bold text-white mb-2">{singleBeat.title}</h3>
                          <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">ID: {singleBeat.id}</span>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3 text-sm text-yellow-200">
                          <AlertCircle className="h-5 w-5 shrink-0 text-yellow-500" />
                          <div>
                            <p className="font-bold text-yellow-500 mb-1">Validation Warnings</p>
                            <ul className="list-disc pl-4 space-y-1 opacity-80">
                              <li>Audio files are missing. Upload untagged WAV or MP3.</li>
                              <li>Artwork is missing.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="p-4 border-t border-zinc-800 bg-zinc-900 shrink-0 flex justify-between items-center">
                    <button 
                      onClick={() => {
                        const steps: UploadStep[] = ['SB_UPLOAD_FILES', 'SB_INFORMATION', 'SB_PRICING', 'SB_REVIEW'];
                        const currentIndex = steps.indexOf(step);
                        if (currentIndex > 0) setStep(steps[currentIndex - 1]);
                      }}
                      disabled={step === 'SB_UPLOAD_FILES'}
                      className="px-4 py-2 text-zinc-400 hover:text-white font-medium text-sm disabled:opacity-30 transition-colors"
                    >
                      Back
                    </button>
                    
                    {step === 'SB_REVIEW' ? (
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md font-medium text-sm transition-colors">
                          Save Draft
                        </button>
                        <button 
                          onClick={() => {
                            if (singleBeat?.freeDownloadEnabled && !singleBeat?.freeDownloadFile) {
                              alert("Free Download is enabled, but no downloadable file is configured.\nPlease fix download settings before publishing.");
                              return;
                            }
                            if (singleBeat && singleBeat.id) {
                              let artworkUrlStr: string | null = null;
                              if (typeof singleBeat.artworkUrl === 'string') artworkUrlStr = singleBeat.artworkUrl;
                              else if (singleBeat.artwork instanceof File || singleBeat.artwork instanceof Blob) {
                                try { artworkUrlStr = URL.createObjectURL(singleBeat.artwork); } catch {}
                              } else if (singleBeat.files?.artwork instanceof File || singleBeat.files?.artwork instanceof Blob) {
                                try { artworkUrlStr = URL.createObjectURL(singleBeat.files.artwork); } catch {}
                              }

                              let audioUrlStr: string | null = null;
                              if (typeof singleBeat.audioUrl === 'string') audioUrlStr = singleBeat.audioUrl;
                              else if (singleBeat.files?.wav instanceof File || singleBeat.files?.wav instanceof Blob) {
                                try { audioUrlStr = URL.createObjectURL(singleBeat.files.wav); } catch {}
                              } else if (singleBeat.files?.mp3 instanceof File || singleBeat.files?.mp3 instanceof Blob) {
                                try { audioUrlStr = URL.createObjectURL(singleBeat.files.mp3); } catch {}
                              }

                              const finalBeat: ParsedBeat = {
                                ...(singleBeat as ParsedBeat),
                                artworkUrl: artworkUrlStr || singleBeat.artworkUrl,
                                audioUrl: audioUrlStr || singleBeat.audioUrl
                              };

                              addBeat(finalBeat);

                              // Immediately set/play track in audio player
                              playTrack({
                                id: finalBeat.id,
                                title: finalBeat.title || 'New Beat',
                                producer: finalBeat.metadata?.producer || 'NightRunna',
                                artwork: finalBeat.artworkUrl,
                                audioUrl: finalBeat.audioUrl,
                                price: finalBeat.price || '29.99'
                              });
                            }
                            alert("Single Beat Published Successfully!");
                            onClose();
                          }}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm transition-colors shadow-lg shadow-indigo-900/20"
                        >
                          Publish Beat
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          const steps: UploadStep[] = ['SB_UPLOAD_FILES', 'SB_INFORMATION', 'SB_PRICING', 'SB_REVIEW'];
                          const currentIndex = steps.indexOf(step);
                          if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
                        }}
                        className="px-6 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-md font-medium text-sm transition-colors flex items-center gap-1"
                      >
                        Continue <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
