import React from 'react';
import { ArrowDown, DoorOpen } from 'lucide-react';

interface VideoTransitionOverlayProps {
  isVisible: boolean;
  opacity: number;
}

export const VideoTransitionOverlay: React.FC<VideoTransitionOverlayProps> = ({
  isVisible,
  opacity,
}) => {
  if (!isVisible && opacity <= 0.01) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center bg-black transition-opacity duration-300"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center text-center p-6 rounded-3xl border border-white/20 bg-black/80 backdrop-blur-2xl shadow-2xl max-w-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 mb-3">
          <DoorOpen className="w-6 h-6 animate-pulse" />
        </div>
        <span className="text-[10px] font-mono tracking-widest uppercase text-blue-300 mb-1">
          ENTERING INTERIOR WING
        </span>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Welcome to Head Office
        </h3>
        <p className="text-xs text-white/60 mt-1 max-w-[240px]">
          Proceeding into executive suites, creative recording studios, and innovation labs.
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-white/40">
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          <span>Continue scrolling</span>
        </div>
      </div>
    </div>
  );
};

