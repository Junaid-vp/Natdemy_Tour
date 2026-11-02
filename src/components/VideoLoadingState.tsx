import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface VideoLoadingStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export const VideoLoadingState: React.FC<VideoLoadingStateProps> = ({
  isLoading,
  error,
  onRetry,
}) => {
  if (!isLoading && !error) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#080808]/90 backdrop-blur-md select-none">
      {error ? (
        <div className="flex flex-col items-center text-center p-6 rounded-3xl border border-red-500/20 bg-red-950/20 max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Playback Notice</h3>
          <p className="text-xs text-white/60 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-mono text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center p-6">
          <div className="relative mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            </div>
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-white/70">
            Initializing Cinematic Stream
          </span>
          <span className="text-[11px] font-mono text-white/40 mt-1">
            Preparing scroll-synchronized timeline...
          </span>
        </div>
      )}
    </div>
  );
};
