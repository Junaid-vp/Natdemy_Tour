import { useEffect, useRef, useCallback } from 'react';

interface ScrubberOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  duration: number;
  isActive: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onBufferingChange?: (isBuffering: boolean) => void;
  onSeekLagDetected?: () => void;
}

export function useScrollVideoScrubber({
  videoRef,
  duration,
  isActive,
  onTimeUpdate,
  onBufferingChange,
}: ScrubberOptions) {
  const targetTimeRef = useRef<number>(0.001);
  const isSeekingRef = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);
  const seekWatchdogRef = useRef<any>(null);
  const lastDispatchedTimeRef = useRef<number>(-1);

  // Notify React of the ACTUAL video playback position (not the scroll target)
  const notifyActualTime = useCallback(
    (actualTime: number) => {
      if (!onTimeUpdate || !Number.isFinite(actualTime)) return;
      if (Math.abs(actualTime - lastDispatchedTimeRef.current) > 0.06) {
        lastDispatchedTimeRef.current = actualTime;
        onTimeUpdate(actualTime);
      }
    },
    [onTimeUpdate]
  );

  // Core seek dispatcher with watchdog to prevent any freeze during fast/speed scrolling
  const performSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    const target = Math.max(0.001, Math.min(targetTimeRef.current, duration));
    const delta = Math.abs(video.currentTime - target);

    // If already at target, notify and finish
    if (delta < 0.015) {
      notifyActualTime(video.currentTime);
      return;
    }

    // If browser is actively in the middle of a seek, let the current seek finish or wait for watchdog
    if (video.seeking || isSeekingRef.current) {
      return;
    }

    try {
      isSeekingRef.current = true;
      video.currentTime = target;

      // Watchdog: If seeked event does not fire within 65ms, clear seeking lock
      // This prevents WebKit/mobile browsers from ever hanging/freezing on fast scrolls
      if (seekWatchdogRef.current) clearTimeout(seekWatchdogRef.current);
      seekWatchdogRef.current = setTimeout(() => {
        isSeekingRef.current = false;
        // Trigger next frame catch-up if still not at target
        if (videoRef.current && Math.abs(videoRef.current.currentTime - targetTimeRef.current) > 0.02) {
          performSeek();
        }
      }, 65);
    } catch {
      isSeekingRef.current = false;
    }
  }, [videoRef, duration, isActive, notifyActualTime]);

  // Request scrub to target time (scheduled via RAF)
  const seekTo = useCallback(
    (targetTime: number) => {
      if (!isActive) return;

      targetTimeRef.current = Math.max(0.001, Math.min(targetTime, duration));

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        performSeek();
        rafId.current = null;
      });
    },
    [isActive, duration, performSeek]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSeeked = () => {
      if (seekWatchdogRef.current) {
        clearTimeout(seekWatchdogRef.current);
        seekWatchdogRef.current = null;
      }
      isSeekingRef.current = false;
      onBufferingChange?.(false);

      // Report actual video time to React
      notifyActualTime(video.currentTime);

      // If user kept scrolling while this seek was executing, immediately seek towards latest target
      const delta = Math.abs(video.currentTime - targetTimeRef.current);
      if (delta > 0.02) {
        performSeek();
      }
    };

    const handleTimeUpdate = () => {
      notifyActualTime(video.currentTime);
    };

    const handleSeeking = () => {
      isSeekingRef.current = true;
    };

    const handleWaiting = () => {
      onBufferingChange?.(true);
    };

    const handleCanPlay = () => {
      onBufferingChange?.(false);
    };

    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      if (seekWatchdogRef.current) clearTimeout(seekWatchdogRef.current);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [videoRef, performSeek, notifyActualTime, onBufferingChange]);

  return { seekTo };
}
