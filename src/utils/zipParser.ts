import JSZip from 'jszip';

export interface ParsedBeat {
  id: string;
  title: string;
  price?: string;
  audioUrl?: string;
  artworkUrl?: string;
  files: {
    wav: any;
    mp3: any;
    m4a: any;
    stems: any;
    artwork: any;
  };
  metadata: {
    genre: string;
    bpm: string;
    key: string;
    mood: string;
    tags: string[];
    description: string;
    producer: string;
  };
  freeDownloadEnabled?: boolean;
  freeDownloadFile?: any; // The file to be delivered
  featured?: boolean;
  published?: boolean;
}

export interface ParsedBeatPack {
  zipId: string;
  packId: string;
  packName: string;
  price?: string;
  coverImage?: any;
  packFile?: any;
  beats: ParsedBeat[];
  rawFiles: string[];
  freeDownloadEnabled?: boolean;
  freeDownloadFile?: any;
}

export async function parseBeatPackZip(file: File, onProgress?: (progress: number) => void): Promise<ParsedBeatPack> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  
  // Generate distinct IDs as required
  const generateId = (prefix: string) => 
    `${prefix}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
  const zipId = generateId('NR-ZIP');
  const packId = generateId('NR-BP');
  
  const fileList = Object.keys(contents.files).filter(path => !contents.files[path].dir);
  
  // Grouping logic based on real file names
  const beatGroups = new Map<string, ParsedBeat>();
  
  // Identify common structural patterns to group by base name
  fileList.forEach((path, index) => {
    if (onProgress) {
      // Fake a slightly progressive callback based on file iteration, 
      // though loadAsync already did the heavy lifting.
      onProgress(Math.floor((index / fileList.length) * 100));
    }

    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    
    // Ignore OS hidden files
    if (filename.startsWith('.') || path.includes('__MACOSX')) return;

    const extMatch = filename.match(/\.([^.]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    
    // Clean up base name (remove extensions and common stem/bpm markers for grouping)
    let baseName = filename
      .replace(/\.[^.]+$/, '') // remove extension
      .replace(/(-stems|_stems| stems)$/i, '') // remove stems marker
      .replace(/(\d+bpm|\d+ bpm)/i, '') // remove BPM markers for cleaner titles
      .trim();
      
    if (!baseName) return;

    if (!beatGroups.has(baseName)) {
      beatGroups.set(baseName, {
        id: generateId('NR-BT'),
        title: baseName,
        files: { wav: null, mp3: null, m4a: null, stems: null, artwork: null },
        metadata: { 
          genre: 'Trap', // Enforced default
          bpm: '', 
          key: '',
          mood: '',
          tags: [],
          description: '',
          producer: ''
        }
      });
    }
    
    const beat = beatGroups.get(baseName)!;
    
    // Assign file to appropriate slot
    if (ext === 'wav') beat.files.wav = path;
    else if (ext === 'mp3') beat.files.mp3 = path;
    else if (ext === 'm4a') beat.files.m4a = path;
    else if (ext === 'zip' || ext === 'rar') beat.files.stems = path;
    else if (['jpg', 'jpeg', 'png'].includes(ext)) beat.files.artwork = path;
  });
  
  if (onProgress) onProgress(100);
  
  return {
    zipId,
    packId,
    packName: file.name.replace(/\.[^.]+$/, ''),
    packFile: file,
    beats: Array.from(beatGroups.values()),
    rawFiles: fileList
  };
}
