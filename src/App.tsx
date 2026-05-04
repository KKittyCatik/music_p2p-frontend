import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Upload, Music, Radio, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import * as api from './api/client';

// ---------------------------------------------------------------------------
// Developer utilities panel — calls representative new endpoints and shows JSON
// ---------------------------------------------------------------------------

type DevPanelEntry = { label: string; result: unknown };

function DevPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<DevPanelEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setLoading(true);
    try {
      const result = await fn();
      setEntries((prev) => [{ label, result }, ...prev].slice(0, 20));
    } finally {
      setLoading(false);
    }
  };

  const buttons: { label: string; fn: () => Promise<unknown> }[] = [
    { label: 'GET /status',          fn: () => api.getStatus() },
    { label: 'GET /playback/status', fn: () => api.getPlaybackStatus() },
    { label: 'GET /queue',           fn: () => api.getQueue() },
    { label: 'GET /queue/history',   fn: () => api.getQueueHistory() },
    { label: 'GET /peers',           fn: () => api.getPeers() },
    { label: 'GET /engine/status',   fn: () => api.getEngineStatus() },
    { label: 'GET /metadata',        fn: () => api.getMetadata() },
    { label: 'POST /playback/stop',  fn: () => api.stopPlayback() },
  ];

  return (
    <div className="border-t border-white/10 mt-auto">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-mono uppercase tracking-wider">Dev Tools</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="px-3 pb-4 space-y-1">
          {buttons.map(({ label, fn }) => (
            <button
              key={label}
              disabled={loading}
              onClick={() => void run(label, fn)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-50 transition"
            >
              {label}
            </button>
          ))}

          {entries.length > 0 && (
            <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
              {entries.map((e, i) => (
                <div key={i} className="bg-black/40 rounded-lg p-2">
                  <p className="text-[10px] font-mono text-purple-400 mb-1">{e.label}</p>
                  <pre className="text-[10px] text-gray-300 whitespace-pre-wrap break-all">
                    {JSON.stringify(e.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<api.TrackMetadata[]>([]);
  const [peerCount, setPeerCount] = useState<number | null>(null);
  const [currentTrack, setCurrentTrack] = useState<api.TrackMetadata | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Increment to trigger a re-fetch after upload
  const [fetchSeed, setFetchSeed] = useState(0);

  useEffect(() => {
    api.getMetadata()
      .then((metaRes) => {
        if (metaRes.success && metaRes.data.length > 0) {
          setTracks(metaRes.data);
        } else {
          api.getTracks()
            .then((tracksRes) => {
              if (tracksRes.success) {
                setTracks(tracksRes.data.map((t) => ({ cid: t.cid })));
              }
            })
            .catch((err) => console.error('Failed to fetch tracks:', err));
        }
      })
      .catch((err) => console.error('Failed to fetch metadata:', err));

    api.getStatus()
      .then((res) => {
        if (res.success) setPeerCount(res.data.peer_count);
      })
      .catch((err) => console.error('Failed to fetch status:', err));
  }, [fetchSeed]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      await api.shareTrack(file, true);
      setFetchSeed((s) => s + 1);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Не удалось загрузить файл. Попробуйте ещё раз.');
    } finally {
      // reset so the same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleTrackClick = async (track: api.TrackMetadata) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    try {
      await api.playTrack(track.cid);
    } catch (err) {
      console.error('Playback failed:', err);
    }
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-gray-100 font-sans relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C3AED]/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-[#EC4899]/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,.mp3"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Sidebar (Dark Glassmorphism) */}
      <aside className="w-64 bg-white/5 backdrop-blur-3xl border-r border-white/10 flex flex-col pt-8 z-10">
        <div className="px-6 mb-8 font-bold text-2xl tracking-tight flex items-center gap-3 text-white">
          <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
            <defs>
              <linearGradient id="rippleLogoGradient" x1="0" y1="0" x2="14" y2="14">
                <stop offset="0%" stopColor="#7C3AED"></stop>
                <stop offset="50%" stopColor="#4F46E5"></stop>
                <stop offset="100%" stopColor="#EC4899"></stop>
              </linearGradient>
              <filter id="rippleLogoGlow">
                <feGaussianBlur stdDeviation="0.8" result="blur"></feGaussianBlur>
                <feMerge>
                  <feMergeNode in="blur"></feMergeNode>
                  <feMergeNode in="SourceGraphic"></feMergeNode>
                </feMerge>
              </filter>
            </defs>
            <line x1="7" y1="4" x2="2" y2="10" stroke="url(#rippleLogoGradient)" strokeWidth="0.8" opacity="0.6"></line>
            <line x1="7" y1="4" x2="12" y2="10" stroke="url(#rippleLogoGradient)" strokeWidth="0.8" opacity="0.6"></line>
            <line x1="2" y1="10" x2="12" y2="10" stroke="url(#rippleLogoGradient)" strokeWidth="0.8" opacity="0.6"></line>
            <circle cx="7" cy="4" r="2" fill="url(#rippleLogoGradient)" filter="url(#rippleLogoGlow)"></circle>
            <circle cx="2" cy="10" r="1.5" fill="url(#rippleLogoGradient)" opacity="0.9" filter="url(#rippleLogoGlow)"></circle>
            <circle cx="12" cy="10" r="1.5" fill="url(#rippleLogoGradient)" opacity="0.9" filter="url(#rippleLogoGlow)"></circle>
          </svg>
          Ripple
        </div>

        {peerCount !== null && (
          <div className="px-6 mb-4 text-xs text-gray-400">
            Peers: {peerCount}
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 text-white font-medium cursor-pointer transition shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <Music size={18} /> <span>Медиатека</span>
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition"
            onClick={handleUploadClick}
          >
            <Upload size={18} /> <span>Загрузить</span>
          </div>
          {uploadError && (
            <p className="px-3 py-1 text-xs text-red-400">{uploadError}</p>
          )}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition">
            <Radio size={18} /> <span>Сеть</span>
          </div>
        </nav>

        {/* Developer utilities panel */}
        <DevPanel />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10">
        <header className="h-20 flex items-center px-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
            Недавно добавленные
          </h1>
        </header>

        <div className="p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto pb-32">
          {tracks.length === 0 ? (
            <p className="text-gray-500 col-span-full text-sm">Треков нет. Загрузите первый!</p>
          ) : (
            tracks.map((track) => (
              <div
                key={track.cid}
                className="group cursor-pointer"
                onClick={() => void handleTrackClick(track)}
              >
                <div className="aspect-square bg-white/5 border border-white/10 rounded-2xl mb-4 relative overflow-hidden shadow-lg group-hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music size={40} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                  <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white text-white hover:text-black">
                    <Play size={18} className="ml-1" fill="currentColor" />
                  </div>
                </div>
                <h3 className="font-semibold text-sm truncate">{track.title ?? 'Unknown Title'}</h3>
                <p className="text-xs text-gray-400 truncate mt-1">{track.artist ?? 'Unknown Artist'}</p>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating Bottom Player */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-20 bg-[#1A1A1D]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl flex items-center px-6 z-20">
        <div className="w-12 h-12 bg-gradient-to-tr from-[#7C3AED] via-[#4F46E5] to-[#EC4899] rounded-lg shadow-inner flex-shrink-0"></div>
        <div className="flex-1 overflow-hidden ml-4">
          <h4 className="font-semibold text-sm truncate text-white">
            {currentTrack?.title ?? currentTrack?.cid ?? '—'}
          </h4>
          <p className="text-xs text-gray-400 truncate">
            {currentTrack?.artist ?? (currentTrack ? currentTrack.cid : '—')}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col items-center flex-1 max-w-md">
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition"><SkipBack size={18} fill="currentColor" /></button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
            </button>
            <button className="text-gray-400 hover:text-white transition"><SkipForward size={18} fill="currentColor" /></button>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mt-2.5 relative group cursor-pointer">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#EC4899] rounded-full w-1/3 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all"></div>
          </div>
        </div>

        <div className="flex-1 flex justify-end items-center gap-3">
          <Settings size={16} className="text-gray-400 hover:text-white cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
