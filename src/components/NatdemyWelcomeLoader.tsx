import React, { useState, useEffect } from 'react';
import { ArrowDown, AlertCircle, RefreshCw, Compass } from 'lucide-react';

interface NatdemyWelcomeLoaderProps {
  isLoaded: boolean;
  error: string | null;
  onRetry?: () => void;
  onStartTour?: () => void;
}

export const NatdemyWelcomeLoader: React.FC<NatdemyWelcomeLoaderProps> = ({
  isLoaded,
  error,
  onRetry,
  onStartTour,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Progressive simulated loading bar that finishes when isLoaded becomes true
  useEffect(() => {
    if (isDismissed) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (!isLoaded) {
          // Creep smoothly towards 85% while waiting for network/video metadata
          if (prev < 85) {
            const step = Math.max(1, (85 - prev) * 0.15);
            return Math.min(85, prev + step);
          }
          return prev;
        } else {
          // Video metadata loaded: smoothly zoom to 100%
          if (prev < 100) {
            const step = Math.max(3, (100 - prev) * 0.35);
            const next = prev + step;
            if (next >= 99.5) {
              setIsReady(true);
              return 100;
            }
            return next;
          }
          setIsReady(true);
          return 100;
        }
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isLoaded, isDismissed]);

  // Auto-dismiss when user starts scrolling anywhere
  useEffect(() => {
    if (isDismissed) return;

    const handleScrollOrTouch = () => {
      if (window.scrollY > 20) {
        setIsDismissed(true);
      }
    };

    window.addEventListener('scroll', handleScrollOrTouch, { passive: true });
    window.addEventListener('wheel', handleScrollOrTouch, { passive: true });
    window.addEventListener('touchmove', handleScrollOrTouch, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrTouch);
      window.removeEventListener('wheel', handleScrollOrTouch);
      window.removeEventListener('touchmove', handleScrollOrTouch);
    };
  }, [isDismissed]);

  const handleStart = () => {
    setIsDismissed(true);
    if (onStartTour) {
      onStartTour();
    }
    // Gently scroll down by 40px to start scrubbing immediately
    window.scrollBy({ top: 40, behavior: 'smooth' });
  };

  // Status subtitle based on progress
  const getStatusText = () => {
    if (error) return 'Connection error';
    if (progress < 40) return 'Preparing visual pipeline...';
    if (progress < 75) return 'Optimizing mobile footage stream...';
    if (progress < 99) return 'Synchronizing spatial timeline...';
    return 'Ready to explore Natdemy Headquarters';
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#080808] px-4 transition-all duration-700 ease-out select-none ${
        isDismissed
          ? 'opacity-0 pointer-events-none scale-105'
          : 'opacity-100 pointer-events-auto scale-100'
      }`}
    >
      {/* Cinematic Ambient Backdrop Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-700/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[140px] pointer-events-none" />

      {/* Main Glassmorphic Welcome Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-black/60 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Subtle Decorative Top Glow Line */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />

        {/* Error State */}
        {error ? (
          <div className="flex flex-col items-center py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Stream Error</h3>
            <p className="text-xs text-white/60 mb-5 max-w-xs">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-5 py-2.5 text-xs font-mono text-white transition-all hover:scale-105 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Animated Brand Mark */}
            <div className="relative mb-4">
              <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-900/40 via-purple-600/20 to-transparent border border-purple-500/30 shadow-[0_0_35px_rgba(95,38,185,0.45)]">
                <img
                  src="/images/natdemy-mark.png"
                  alt="Natdemy Mark"
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-[0_0_15px_rgba(95,38,185,0.8)] animate-pulse"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              </div>
            </div>

            {/* Overline Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono font-semibold tracking-[0.25em] text-purple-300 uppercase">
                WELCOME TO
              </span>
            </div>

            {/* Official Wordmark */}
            <div className="my-1.5">
              <img
                src="/images/natdemy-logo-white.png"
                alt="Natdemy"
                className="h-8 sm:h-9 w-auto object-contain mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Tour Subtitle */}
            <p className="text-xs sm:text-sm text-white/70 font-medium tracking-tight mt-1 mb-5">
              Cinematic Virtual Office Tour & Walkthrough
            </p>

            {/* Progress Bar & Status (While Loading) */}
            {!isReady ? (
              <div className="w-full space-y-2 mt-2">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-white/50">
                  <span className="truncate pr-2">{getStatusText()}</span>
                  <span className="text-purple-400 font-bold">{Math.round(progress)}%</span>
                </div>
                {/* Glowing Track */}
                <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-400 transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Ready Action Button */
              <div className="w-full space-y-3 mt-2 animate-fade-in">
                <button
                  onClick={handleStart}
                  className="group relative w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-3.5 text-xs sm:text-sm font-bold tracking-wider text-white uppercase shadow-[0_0_30px_rgba(95,38,185,0.6)] hover:shadow-[0_0_40px_rgba(95,38,185,0.9)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-purple-400/40"
                >
                  <span>START OFFICE TOUR</span>
                  <ArrowDown className="w-4 h-4 text-emerald-300 group-hover:translate-y-0.5 transition-transform" />
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono tracking-wider text-white/40">
                  <span>or scroll down to explore</span>
                  <span>•</span>
                  <span className="text-emerald-400">12 rooms</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
