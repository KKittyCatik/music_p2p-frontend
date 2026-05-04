import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Upload, Music, Radio, Settings } from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex h-screen bg-[#09090B] text-gray-100 font-sans relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C3AED]/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-[#EC4899]/20 blur-[100px] rounded-full pointer-events-none"></div>

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
        <nav className="flex-1 px-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 text-white font-medium cursor-pointer transition shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <Music size={18} /> <span>Медиатека</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition">
            <Upload size={18} /> <span>Загрузить</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition">
            <Radio size={18} /> <span>Сеть</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10">
        <header className="h-20 flex items-center px-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
            Недавно добавленные
          </h1>
        </header>

        <div className="p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto pb-32">
          {/* Example Track Card */}
          <div className="group cursor-pointer">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-2xl mb-4 relative overflow-hidden shadow-lg group-hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                <Music size={40} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
              <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white text-white hover:text-black">
                <Play size={18} className="ml-1" fill="currentColor" />
              </div>
            </div>
            <h3 className="font-semibold text-sm truncate">Nightcall</h3>
            <p className="text-xs text-gray-400 truncate mt-1">Kavinsky</p>
          </div>
        </div>
      </main>

      {/* Floating Bottom Player */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-20 bg-[#1A1A1D]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl flex items-center px-6 z-20">
        <div className="w-12 h-12 bg-gradient-to-tr from-[#7C3AED] via-[#4F46E5] to-[#EC4899] rounded-lg shadow-inner flex-shrink-0"></div>
        <div className="flex-1 overflow-hidden ml-4">
          <h4 className="font-semibold text-sm truncate text-white">Nightcall</h4>
          <p className="text-xs text-gray-400 truncate">Kavinsky</p>
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
