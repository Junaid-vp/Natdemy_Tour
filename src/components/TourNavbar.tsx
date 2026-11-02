import React from 'react';
import { Play, Pause, Layers } from 'lucide-react';

interface TourNavbarProps {
  onOpenDirectory: () => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  quality: 'hd' | 'lite';
  onToggleQuality: () => void;
}

export const TourNavbar: React.FC<TourNavbarProps> = ({
  onOpenDirectory,
  isAutoPlaying,
  onToggleAutoPlay,
  quality,
  onToggleQuality,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-40 px-3 pt-[max(3.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))] sm:px-6 sm:pt-5 pointer-events-none select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Compact Top-Left Official Natdemy Branding */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pointer-events-auto flex items-center rounded-xl border border-white/10 bg-black/60 px-2.5 sm:px-3 py-1.5 backdrop-blur-md shadow-lg hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer"
          aria-label="Natdemy Home"
          title="Natdemy - Tap to scroll to start"
        >
          <img
            src="/images/natdemy-logo-white.png"
            alt="Natdemy"
            className="h-5 sm:h-6 w-auto object-contain"
          />
        </button>

        {/* Top-Right Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Quality Stream Toggle (HD vs LITE) */}
          <button
            onClick={onToggleQuality}
            aria-label="Toggle video stream quality"
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/60 px-2 sm:px-2.5 py-1.5 backdrop-blur-md text-[10px] sm:text-xs font-mono tracking-wider text-white/80 transition-all hover:bg-white/10 hover:text-white shadow-lg"
            title={quality === 'hd' ? 'Current: HD. Tap for Lite stream.' : 'Current: Lite. Tap for HD stream.'}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${quality === 'hd' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span>{quality === 'hd' ? 'HD' : 'LITE'}</span>
          </button>

          {/* Hands-Free AUTO WALK Button */}
          <button
            onClick={onToggleAutoPlay}
            aria-label={isAutoPlaying ? 'Pause tour' : 'Auto-play tour'}
            className={`group flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 backdrop-blur-md text-[10px] sm:text-xs font-mono tracking-wider transition-all duration-200 shadow-lg ${
              isAutoPlaying
                ? 'bg-blue-600/90 border-blue-400 text-white shadow-blue-600/30'
                : 'bg-black/60 border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current text-white animate-pulse" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current text-blue-400 group-hover:text-blue-300" />
                <span>AUTO<span className="hidden sm:inline"> WALK</span></span>
              </>
            )}
          </button>

          {/* ROOMS Directory Button */}
          <button
            onClick={onOpenDirectory}
            aria-label="View room directory"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/60 px-2.5 sm:px-3 py-1.5 backdrop-blur-md text-[10px] sm:text-xs font-mono tracking-wider text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white hover:border-white/20 shadow-lg"
          >
            <Layers className="w-3 h-3 text-blue-400" />
            <span>ROOMS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
