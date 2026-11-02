import React from 'react';
import { TIMELINE_MILESTONES, TimelineMilestone } from '../config/tourTimeline';

interface TourProgressIndicatorProps {
  totalProgress: number; // 0 to 1
  onJumpToMilestone: (milestone: TimelineMilestone) => void;
}

export const TourProgressIndicator: React.FC<TourProgressIndicatorProps> = ({
  totalProgress,
  onJumpToMilestone,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, totalProgress));

  // Determine current active milestone
  const activeMilestone = React.useMemo(() => {
    let current = TIMELINE_MILESTONES[0];
    for (const m of TIMELINE_MILESTONES) {
      if (clampedProgress >= m.normalizedProgress - 0.04) {
        current = m;
      }
    }
    return current;
  }, [clampedProgress]);

  // Arrow offset percentage clamped so it stays neatly inside track bounds
  const arrowPositionPercent = Math.max(1, Math.min(99, clampedProgress * 100));

  return (
    <div className="absolute bottom-0 inset-x-0 z-30 pointer-events-none pb-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))] px-3 sm:px-6 select-none">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Progress Timeline Card */}
        <div className="pointer-events-auto w-full rounded-2xl border border-white/10 bg-black/80 px-3.5 py-2.5 backdrop-blur-xl shadow-2xl">
          {/* Continuously Moving Timeline Arrow directly above the track */}
          <div className="relative w-full h-3.5 overflow-visible">
            <div
              className="absolute top-0 -translate-x-1/2 flex items-center justify-center transition-all duration-75 ease-out"
              style={{ left: `${arrowPositionPercent}%` }}
            >
              <span className="text-[12px] font-bold text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.9)] leading-none select-none animate-pulse">
                →
              </span>
            </div>
          </div>

          {/* Thin Progress Track with blue-to-purple gradient */}
          <div className="relative h-1 w-full rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-75 ease-out"
              style={{ width: `${clampedProgress * 100}%` }}
            />
          </div>

          {/* 5 Simple Milestones: START → HEAD OFFICE → STUDIOS → INNOVATION → END */}
          <div className="mt-2 flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-wider">
            {TIMELINE_MILESTONES.map((milestone, index) => {
              const isActive = activeMilestone.id === milestone.id;
              const isPast = clampedProgress >= milestone.normalizedProgress;

              return (
                <React.Fragment key={milestone.id}>
                  <button
                    onClick={() => onJumpToMilestone(milestone)}
                    className={`transition-colors py-0.5 cursor-pointer uppercase ${
                      isActive
                        ? 'text-blue-400 font-bold drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]'
                        : isPast
                        ? 'text-white/80 hover:text-white'
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    {milestone.label}
                  </button>

                  {index < TIMELINE_MILESTONES.length - 1 && (
                    <span className="text-white/20 select-none text-[8px] sm:text-[9px]">
                      →
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
