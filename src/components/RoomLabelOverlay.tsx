import React from 'react';
import { RoomMarker } from '../types/tour';

interface RoomLabelOverlayProps {
  markers: RoomMarker[];
}

export const RoomLabelOverlay: React.FC<RoomLabelOverlayProps> = ({ markers }) => {
  const leftMarker = markers.find((m) => m.side === 'left');
  const rightMarker = markers.find((m) => m.side === 'right');
  const centerMarker = markers.find((m) => m.side === 'center');

  if (!leftMarker && !rightMarker && !centerMarker) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[max(8.5rem,calc(env(safe-area-inset-bottom,0px)+7.5rem))] sm:bottom-[150px] z-20 px-3 sm:px-5 flex items-end justify-between select-none">
      {/* Subtle Left Edge Card */}
      <div className="w-auto max-w-[160px] sm:max-w-[200px]">
        {leftMarker && (
          <div
            key={leftMarker.id}
            className="pointer-events-auto rounded-xl border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-md shadow-xl transition-all duration-300"
            style={{
              animation: 'fadeSlideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <div className="text-[9px] font-mono font-semibold tracking-wider text-blue-400 uppercase">
              ← {leftMarker.badge || 'ROOM'}
            </div>
            <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-white mt-0.5 leading-tight">
              {leftMarker.title}
            </h3>
          </div>
        )}
      </div>

      {/* Subtle Center / Straight Ahead Card */}
      {centerMarker && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-auto max-w-[190px] sm:max-w-[230px]">
          <div
            key={centerMarker.id}
            className="pointer-events-auto rounded-xl border border-emerald-500/30 bg-black/85 px-3.5 py-2 backdrop-blur-md shadow-xl transition-all duration-300 text-center"
            style={{
              animation: 'fadeZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <div className="text-[9px] font-mono font-semibold tracking-wider text-emerald-400 uppercase flex items-center justify-center gap-1">
              <span>↑</span>
              <span>{centerMarker.badge || 'STRAIGHT AHEAD'}</span>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-white mt-0.5 leading-tight">
              {centerMarker.title}
            </h3>
          </div>
        </div>
      )}

      {/* Subtle Right Edge Card */}
      <div className="w-auto max-w-[160px] sm:max-w-[200px] ml-auto text-right">
        {rightMarker && (
          <div
            key={rightMarker.id}
            className="pointer-events-auto rounded-xl border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-md shadow-xl transition-all duration-300"
            style={{
              animation: 'fadeSlideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <div className="text-[9px] font-mono font-semibold tracking-wider text-purple-400 uppercase">
              {rightMarker.badge || 'ROOM'} →
            </div>
            <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-white mt-0.5 leading-tight">
              {rightMarker.title}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};
