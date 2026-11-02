import React from 'react';
import { RoomMarker } from '../types/tour';
import { X } from 'lucide-react';

interface RoomDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  markers: RoomMarker[];
  activeRoomId: string;
  onJumpToRoom: (marker: RoomMarker) => void;
}

export const RoomDirectoryModal: React.FC<RoomDirectoryModalProps> = ({
  isOpen,
  onClose,
  markers,
  activeRoomId,
  onJumpToRoom,
}) => {
  if (!isOpen) return null;

  const part1Rooms = markers.filter((m) => m.videoId === 'part1');
  const part2Rooms = markers.filter((m) => m.videoId === 'part2');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-white/15 bg-[#101014] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 p-1.5 shadow-sm">
              <img
                src="/images/natdemy-mark.png"
                alt="Natdemy Mark"
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Natdemy Office Tour
                </h2>
                <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 rounded">
                  INDEX
                </span>
              </div>
              <p className="text-xs text-white/50">
                12 verified locations • Direct timeline navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Room List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Part 1: Campus & Exterior */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                PART 1
              </span>
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/60">
                Exterior & Main Entrance
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {part1Rooms.map((room) => {
                const isActive = activeRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      onJumpToRoom(room);
                      onClose();
                    }}
                    className={`group flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] font-mono text-blue-400">
                        {formatTime(room.timestamp)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-white/40 uppercase">
                          {room.side === 'center' ? 'STRAIGHT' : room.side}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase">
                          {room.badge || 'ROOM'}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                      {room.title}
                    </span>
                    {room.subtitle && (
                      <span className="text-xs text-white/50 mt-0.5">
                        {room.subtitle}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Part 2: Headquarters & Studios */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                PART 2
              </span>
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/60">
                Headquarters & Departmental Suites
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {part2Rooms.map((room) => {
                const isActive = activeRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      onJumpToRoom(room);
                      onClose();
                    }}
                    className={`group flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] font-mono text-purple-400">
                        {formatTime(room.timestamp)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-white/40 uppercase">
                          {room.side === 'center' ? 'STRAIGHT' : room.side}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase">
                          {room.badge || 'ROOM'}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                      {room.title}
                    </span>
                    {room.subtitle && (
                      <span className="text-xs text-white/50 mt-0.5">
                        {room.subtitle}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between text-xs text-white/50 bg-black/40">
          <span>Click any room to navigate directly</span>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-400 font-mono transition-colors"
          >
            Close ✕
          </button>
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
