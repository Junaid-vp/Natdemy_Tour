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
  onSeekLagDetected,
}: ScrubberOptions) {
  const pendingTargetTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);
  const isSeeking = useRef<boolean>(false);
  const lastReportedTime = useRef<number>(-1);
  const lastUpdateTimeStamp = useRef<number>(0);
  const seekStartTime = useRef<number>(0);
  const dynamicThrottleMs = useRef<number>(75);
  const slowSeeksCount = useRef<number>(0);

  // Throttled notification to React state to prevent 60fps re-renders
  const notifyTimeUpdate = useCallback(
    (time: number, force = false) => {
      if (!onTimeUpdate) return;
      const now = performance.now();
      if (
        force ||
        now - lastUpdateTimeStamp.current > dynamicThrottleMs.current ||
        Math.abs(time - lastReportedTime.current) > 0.4
      ) {
        lastReportedTime.current = time;
        lastUpdateTimeStamp.current = now;
        onTimeUpdate(time);
      }
    },
    [onTimeUpdate]
  );

  // Apply seek to video element
  const applySeek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(time)) return;

      // Ensure clampedTime is at least 0.001s so mobile Safari/WebKit decodes and paints the first frame
      const clampedTime = Math.max(0.001, Math.min(time, duration));

      // Don't seek if delta is negligible (unless video hasn't rendered first frame yet)
      if (Math.abs(video.currentTime - clampedTime) < 0.01 && video.currentTime > 0) {
        notifyTimeUpdate(clampedTime);
        return;
      }

      if (video.seeking || isSeeking.current) {
        // Coalesce: keep only the latest requested seek time
        pendingTargetTime.current = clampedTime;
      } else {
        try {
          isSeeking.current = true;
          seekStartTime.current = performance.now();

          // Use fastSeek if available and scrub is large, otherwise exact currentTime
          const delta = Math.abs(video.currentTime - clampedTime);
          if (typeof (video as any).fastSeek === 'function' && delta > 1.5) {
            (video as any).fastSeek(clampedTime);
          } else {
            video.currentTime = clampedTime;
          }

          notifyTimeUpdate(clampedTime);
        } catch {
          isSeeking.current = false;
        }
      }
    },
    [videoRef, duration, notifyTimeUpdate]
  );

  // Request scrub to target time (scheduled via RAF)
  const seekTo = useCallback(
    (targetTime: number) => {
      if (!isActive) return;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        applySeek(targetTime);
        rafId.current = null;
      });
    },
    [isActive, applySeek]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSeeked = () => {
      const now = performance.now();
      const seekDuration = now - seekStartTime.current;

      // Adaptive throttle: If device hardware decoder is taking > 110ms per seek,
      // back off throttle frequency to protect low-end CPU/GPU from backpressure
      if (seekDuration > 110) {
        slowSeeksCount.current += 1;
        dynamicThrottleMs.current = Math.min(160, dynamicThrottleMs.current + 15);
        if (slowSeeksCount.current >= 4) {
          onSeekLagDetected?.();
        }
      } else if (seekDuration < 45 && dynamicThrottleMs.current > 75) {
        dynamicThrottleMs.current = Math.max(75, dynamicThrottleMs.current - 10);
      }

      isSeeking.current = false;
      onBufferingChange?.(false);

      // If a newer seek was queued during this seek, process it immediately
      if (pendingTargetTime.current !== null) {
        const nextTime = pendingTargetTime.current;
        pendingTargetTime.current = null;
        applySeek(nextTime);
      } else {
        notifyTimeUpdate(video.currentTime, true);
      }
    };

    const handleSeeking = () => {
      isSeeking.current = true;
    };

    const handleWaiting = () => {
      onBufferingChange?.(true);
    };

    const handleCanPlay = () => {
      onBufferingChange?.(false);
    };

    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [videoRef, applySeek, notifyTimeUpdate, onBufferingChange, onSeekLagDetected]);

  return { seekTo };
}
