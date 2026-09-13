import React, { useState, useMemo } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { 
  HardDrive, Search, Filter, Play, Download, MoreVertical, 
  FileAudio, Image as ImageIcon, Archive, FileText, CheckCircle2
} from 'lucide-react';

export function Storage() {
  const { files, beats, beatPacks } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Aggregate files dynamically from files state + parsed beats and beat packs
  const allFiles = useMemo(() => {
    const list = [...files];

    beats.forEach(beat => {
      if (beat.files?.audio) {
        list.push({
          id: `FILE-AUDIO-${beat.id}`,
          filename: beat.files.audio.name || `${beat.title}.wav`,
          type: 'WAV',
          size: `${(beat.files.audio.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: new Date().toLocaleDateString(),
          associatedBeatId: beat.id
        });
      }
      if (beat.files?.artwork) {
        list.push({
          id: `FILE-ART-${beat.id}`,
          filename: beat.files.artwork.name || `${beat.title}_cover.jpg`,
          type: 'ARTWORK',
          size: `${(beat.files.artwork.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: new Date().toLocaleDateString(),
          associatedBeatId: beat.id
        });
      }
    });

    beatPacks.forEach(pack => {
      if (pack.packFile) {
        list.push({
          id: `FILE-ZIP-${pack.packId}`,
          filename: pack.packFile.name || `${pack.packName}.zip`,
          type: 'ZIP',
          size: `${(pack.packFile.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: new Date().toLocaleDateString(),
          associatedPackId: pack.packId
        });
      }
    });

    return list;
  }, [files, beats, beatPacks]);

  const filteredFiles = allFiles.filter(f => {
    const matchesSearch = 
      f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.associatedBeatId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.associatedPackId || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedType === 'All') return matchesSearch;
    if (selectedType === 'Audio') return matchesSearch && (f.type === 'WAV' || f.type === 'MP3' || f.type === 'M4A');
    if (selectedType === 'Artwork') return matchesSearch && f.type === 'ARTWORK';
    if (selectedType === 'ZIPs/Stems') return matchesSearch && (f.type === 'ZIP' || f.type === 'STEMS');

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            File Storage & Asset Vault
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-mono">{allFiles.length} Assets</span>
          </h2>
          <p className="text-sm text-zinc-400">Secure storage for master audio files, stem archives, and high-res artwork.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search filename or Beat ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>

          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs font-bold text-zinc-400">
            {['All', 'Audio', 'Artwork', 'ZIPs/Stems'].map(tab => (
              <button 
                key={tab}
                onClick={() => setSelectedType(tab)}
                className={`px-3 py-1 rounded transition-colors ${selectedType === tab ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {allFiles.length === 0 ? (
        <div className="border border-zinc-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <HardDrive className="h-6 w-6 text-zinc-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Files Uploaded</h3>
          <p className="text-zinc-400 mb-6 max-w-md">Audio WAVs, artwork images, and zip archives uploaded through the Upload Center will appear here.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950/70 text-xs uppercase font-semibold text-zinc-500">
                <tr>
                  <th className="px-6 py-3.5">Filename</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Size</th>
                  <th className="px-6 py-3.5">Associated Record</th>
                  <th className="px-6 py-3.5">Upload Date</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-indigo-400">
                          {file.type === 'ARTWORK' ? <ImageIcon className="w-4 h-4" /> : (file.type === 'ZIP' || file.type === 'STEMS' ? <Archive className="w-4 h-4" /> : <FileAudio className="w-4 h-4" />)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 truncate max-w-xs">{file.filename}</p>
                          <span className="text-xs text-zinc-500 font-mono">{file.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                        {file.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-300">{file.size}</td>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-400">
                      {file.associatedBeatId ? `Beat: ${file.associatedBeatId}` : (file.associatedPackId ? `Pack: ${file.associatedPackId}` : 'General Vault')}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{file.uploadDate}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Secure
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
