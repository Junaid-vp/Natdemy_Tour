import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VIDEO_TRACKS, ROOM_TIMELINE, TimelineMilestone } from '../config/tourTimeline';
import { RoomMarker } from '../types/tour';
import { useScrollVideoScrubber } from '../hooks/useScrollVideoScrubber';
import { TourNavbar } from './TourNavbar';
import { RoomLabelOverlay } from './RoomLabelOverlay';
import { TourProgressIndicator } from './TourProgressIndicator';
import { VideoTransitionOverlay } from './VideoTransitionOverlay';
import { RoomDirectoryModal } from './RoomDirectoryModal';
import { VideoLoadingState } from './VideoLoadingState';
import { NatdemyWelcomeLoader } from './NatdemyWelcomeLoader';

export const CompanyTourPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);

  // Total virtual scroll distance in viewport heights (gives ~9000-10000px for silky smooth scrubbing)
  const TOTAL_SCROLL_HEIGHT_VH = 1200;

  // Track configs
  const track1 = VIDEO_TRACKS[0];
  const track2 = VIDEO_TRACKS[1];
  const totalDuration = track1.duration + track2.duration;
  // Normalized split point strictly proportional to video durations
  const splitPoint = track1.duration / totalDuration; // approx 0.2684

  // Reactive state for UI updates (throttled)
  const [currentTrackId, setCurrentTrackId] = useState<'part1' | 'part2'>('part1');
  const [currentTrackTime, setCurrentTrackTime] = useState<number>(0);
  const [activeMarkers, setActiveMarkers] = useState<RoomMarker[]>([]);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [transitionProgress, setTransitionProgress] = useState<number>(0);
  const [video1Loaded, setVideo1Loaded] = useState<boolean>(false);
  const [video2Loaded, setVideo2Loaded] = useState<boolean>(false);
  const [shouldLoadVideo2, setShouldLoadVideo2] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quality, setQuality] = useState<'hd' | 'lite'>(() => {
    if (typeof window === 'undefined') return 'hd';
    try {
      const nav = navigator as any;
      if (
        nav.connection?.saveData === true ||
        ['slow-2g', '2g', '3g'].includes(nav.connection?.effectiveType) ||
        (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) ||
        (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4)
      ) {
        return 'lite';
      }
    } catch {}
    return 'hd';
  });
  const [hasSeekLag, setHasSeekLag] = useState<boolean>(false);

  // iOS Safari decoder priming tracker
  const primedRef = useRef<{ part1: boolean; part2: boolean }>({ part1: false, part2: false });

  // Prime video on iOS Safari / WebKit by briefly playing and pausing (enables hardware CALayer texture)
  const primeVideo = useCallback(async (video: HTMLVideoElement | null, trackId: 'part1' | 'part2') => {
    if (!video || primedRef.current[trackId]) return;
    try {
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        video.pause();
        primedRef.current[trackId] = true;
      }
    } catch {
      // Will be primed on first user gesture
    }
  }, []);

  // Guarantee iOS priming on the very first touch/scroll anywhere on the screen
  useEffect(() => {
    const handleFirstTouchOrInteraction = () => {
      if (video1Ref.current && !primedRef.current.part1) {
        primeVideo(video1Ref.current, 'part1');
      }
      if (video2Ref.current && shouldLoadVideo2 && !primedRef.current.part2) {
        primeVideo(video2Ref.current, 'part2');
      }
    };

    window.addEventListener('touchstart', handleFirstTouchOrInteraction, { passive: true, once: true });
    window.addEventListener('pointerdown', handleFirstTouchOrInteraction, { passive: true, once: true });
    window.addEventListener('scroll', handleFirstTouchOrInteraction, { passive: true, once: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstTouchOrInteraction);
      window.removeEventListener('pointerdown', handleFirstTouchOrInteraction);
      window.removeEventListener('scroll', handleFirstTouchOrInteraction);
    };
  }, [primeVideo, shouldLoadVideo2]);

  // Compute active video URLs based on selected quality tier
  const track1Src = quality === 'lite' && track1.liteSrc ? track1.liteSrc : track1.src;
  const track2Src = quality === 'lite' && track2.liteSrc ? track2.liteSrc : track2.src;

  const handleToggleQuality = useCallback(() => {
    setQuality((prev) => {
      const next = prev === 'hd' ? 'lite' : 'hd';
      const t1 = video1Ref.current?.currentTime || 0;
      const t2 = video2Ref.current?.currentTime || 0;
      setTimeout(() => {
        if (video1Ref.current) video1Ref.current.currentTime = t1;
        if (video2Ref.current && shouldLoadVideo2) video2Ref.current.currentTime = t2;
      }, 50);
      return next;
    });
  }, [shouldLoadVideo2]);



  // Hook scrubbers for each video
  const { seekTo: seekVideo1 } = useScrollVideoScrubber({
    videoRef: video1Ref,
    duration: track1.duration,
    isActive: currentTrackId === 'part1',
    onTimeUpdate: (time) => {
      if (currentTrackId === 'part1') {
        setCurrentTrackTime(time);
      }
    },
    onSeekLagDetected: () => setHasSeekLag(true),
  });

  const { seekTo: seekVideo2 } = useScrollVideoScrubber({
    videoRef: video2Ref,
    duration: track2.duration,
    isActive: currentTrackId === 'part2',
    onTimeUpdate: (time) => {
      if (currentTrackId === 'part2') {
        setCurrentTrackTime(time);
      }
    },
    onSeekLagDetected: () => setHasSeekLag(true),
  });

  // Calculate active markers whenever track or time updates
  useEffect(() => {
    const currentVideoMarkers = ROOM_TIMELINE.filter(
      (m) => m.videoId === currentTrackId
    );

    const matching = currentVideoMarkers.filter((m) => {
      // Approach lead-in (1.5s prior) and calibrated viewing duration
      const start = Math.max(0, m.timestamp - 1.5);
      const end = m.timestamp + (m.duration || 4.5);
      return currentTrackTime >= start && currentTrackTime <= end;
    });

    // Enforce strict mutual exclusivity for sequential rooms:
    // Only allow simultaneous markers if they are a genuine Left + Right pair (same timestamp)
    let filteredMarkers = matching;
    if (matching.length > 1) {
      const hasLeft = matching.some((m) => m.side === 'left');
      const hasRight = matching.some((m) => m.side === 'right');
      const sameTimestamp = Math.abs(matching[0].timestamp - matching[1].timestamp) < 0.2;

      if (hasLeft && hasRight && sameTimestamp && matching.length === 2) {
        // Valid dual simultaneous labels on opposite sides of the corridor
        filteredMarkers = matching;
      } else {
        // Sequential rooms in proximity: pick only the single room closest to currentTrackTime
        const closest = matching.reduce((prev, curr) => {
          return Math.abs(curr.timestamp - currentTrackTime) < Math.abs(prev.timestamp - currentTrackTime)
            ? curr
            : prev;
        });
        filteredMarkers = [closest];
      }
    }

    setActiveMarkers(filteredMarkers);
  }, [currentTrackId, currentTrackTime]);

  // Master scroll handler: maps window scroll position to video timelines
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = window.scrollY;
    const maxScroll = container.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const normalized = Math.max(0, Math.min(1, scrollTop / maxScroll));

    // Eagerly preload video 2 when user passes 15% of tour
    if (normalized > 0.12 && !shouldLoadVideo2) {
      setShouldLoadVideo2(true);
    }

    // Determine active track and transition overlay
    const transitionZone = 0.018; // ~1.8% of scroll zone around split point
    if (normalized < splitPoint) {
      // PART 1
      setCurrentTrackId('part1');
      const localProgress = normalized / splitPoint;
      const targetTime = localProgress * track1.duration;
      seekVideo1(targetTime);

      // Check transition proximity to split point
      if (normalized > splitPoint - transitionZone) {
        const transRatio = (normalized - (splitPoint - transitionZone)) / transitionZone;
        setTransitionProgress(transRatio * 0.8);
      } else {
        setTransitionProgress(0);
      }
    } else {
      // PART 2
      setCurrentTrackId('part2');
      const localProgress = (normalized - splitPoint) / (1 - splitPoint);
      const targetTime = localProgress * track2.duration;
      seekVideo2(targetTime);

      // Check transition exiting split point
      if (normalized < splitPoint + transitionZone) {
        const transRatio = 1 - (normalized - splitPoint) / transitionZone;
        setTransitionProgress(transRatio * 0.8);
      } else {
        setTransitionProgress(0);
      }
    }
  }, [splitPoint, track1.duration, track2.duration, seekVideo1, seekVideo2, shouldLoadVideo2]);

  // Scroll listener registration
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize initial frame
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Auto-play / hands-free mode loop
  useEffect(() => {
    if (!isAutoPlaying) return;

    let lastTime = performance.now();
    let animFrame: number;

    const autoScrollStep = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const container = containerRef.current;
      if (container) {
        const maxScroll = container.offsetHeight - window.innerHeight;
        // Total tour in seconds is totalDuration. Scroll speed = maxScroll / totalDuration px/sec
        const pxPerSec = maxScroll / (totalDuration * 0.85); // slightly faster than 1x for engaging auto-walk
        const nextScroll = window.scrollY + pxPerSec * dt;

        if (nextScroll >= maxScroll) {
          window.scrollTo({ top: maxScroll });
          setIsAutoPlaying(false);
          return;
        }

        window.scrollTo({ top: nextScroll });
      }

      animFrame = requestAnimationFrame(autoScrollStep);
    };

    animFrame = requestAnimationFrame(autoScrollStep);
    return () => cancelAnimationFrame(animFrame);
  }, [isAutoPlaying, totalDuration]);

  // Jump to specific milestone (START, HEAD OFFICE, STUDIOS, INNOVATION, END)
  const handleJumpToMilestone = useCallback(
    (milestone: TimelineMilestone) => {
      setIsAutoPlaying(false);
      const container = containerRef.current;
      if (!container) return;

      const maxScroll = container.offsetHeight - window.innerHeight;
      const targetScroll = milestone.normalizedProgress * maxScroll;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    },
    []
  );

  // Jump to specific room marker
  const handleJumpToRoom = useCallback(
    (marker: RoomMarker) => {
      setIsAutoPlaying(false);
      const container = containerRef.current;
      if (!container) return;

      const maxScroll = container.offsetHeight - window.innerHeight;

      let targetNormalized = 0;
      if (marker.videoId === 'part1') {
        const localRatio = marker.timestamp / track1.duration;
        targetNormalized = localRatio * splitPoint;
      } else {
        const localRatio = marker.timestamp / track2.duration;
        targetNormalized = splitPoint + localRatio * (1 - splitPoint);
      }

      const targetScroll = targetNormalized * maxScroll;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    },
    [splitPoint, track1.duration, track2.duration]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyJ') {
        window.scrollBy({ top: 120, behavior: 'smooth' });
      } else if (e.code === 'ArrowUp' || e.code === 'KeyK') {
        window.scrollBy({ top: -120, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#080808] text-white selection:bg-blue-600 selection:text-white"
      style={{
        // Virtual scroll height strictly proportional to video durations for exact timeline mapping
        height: `${TOTAL_SCROLL_HEIGHT_VH}vh`,
      }}
    >
      {/* Pinned Video Stage (Fixed viewport) */}
      <div className="fixed inset-0 w-full h-[100dvh] min-h-screen overflow-hidden flex items-center justify-center bg-black">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />

        {/* Video Frame Wrapper - Maintains Portrait 9:16 Aspect Ratio on Large Screens, Fullbleed on Mobile */}
        <div className="relative w-full h-full sm:max-w-[480px] md:max-w-[540px] sm:aspect-[9/16] sm:rounded-3xl sm:overflow-hidden sm:border sm:border-white/10 sm:shadow-2xl bg-black">
          {/* Part 1 Video */}
          <video
            ref={(el) => {
              video1Ref.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                el.setAttribute('muted', '');
                el.setAttribute('playsinline', '');
                el.setAttribute('webkit-playsinline', '');
              }
            }}
            src={track1Src}
            poster={track1.poster}
            muted
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            preload="auto"
            onLoadedData={() => {
              setVideo1Loaded(true);
              primeVideo(video1Ref.current, 'part1');
            }}
            onCanPlay={() => {
              setVideo1Loaded(true);
              primeVideo(video1Ref.current, 'part1');
            }}
            onError={() => setLoadError('Unable to load exterior video footage.')}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 will-change-transform ${
              currentTrackId === 'part1' ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          />

          {/* Part 2 Video (Lazy-loaded) */}
          <video
            ref={(el) => {
              video2Ref.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                el.setAttribute('muted', '');
                el.setAttribute('playsinline', '');
                el.setAttribute('webkit-playsinline', '');
              }
            }}
            src={shouldLoadVideo2 ? track2Src : undefined}
            poster={track2.poster}
            muted
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            preload={shouldLoadVideo2 ? 'auto' : 'none'}
            onLoadedData={() => {
              setVideo2Loaded(true);
              primeVideo(video2Ref.current, 'part2');
            }}
            onCanPlay={() => {
              setVideo2Loaded(true);
              primeVideo(video2Ref.current, 'part2');
            }}
            onError={() => {
              if (shouldLoadVideo2) {
                setLoadError('Unable to load interior video footage.');
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 will-change-transform ${
              currentTrackId === 'part2' ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          />

          {/* Vignette Overlay for Premium Cinematic Contrast */}
          <div className="pointer-events-none absolute inset-0 z-15 bg-gradient-to-t from-black/80 via-transparent to-black/60" />

          {/* Subtle Edge Room Labels */}
          <RoomLabelOverlay markers={activeMarkers} />

          {/* Timeline Progress Bar with Continuously Moving Arrow - 100% synchronized to actual video playback */}
          <TourProgressIndicator
            totalProgress={
              currentTrackId === 'part1'
                ? Math.max(0, Math.min(1, currentTrackTime / totalDuration))
                : Math.max(0, Math.min(1, (track1.duration + currentTrackTime) / totalDuration))
            }
            onJumpToMilestone={handleJumpToMilestone}
          />

          {/* Seamless Transition Overlay between Part 1 and Part 2 */}
          <VideoTransitionOverlay
            isVisible={transitionProgress > 0.05}
            opacity={transitionProgress}
          />

          {/* Video Loading State for Part 2 */}
          <VideoLoadingState
            isLoading={currentTrackId === 'part2' && shouldLoadVideo2 && !video2Loaded}
            error={loadError}
            onRetry={() => {
              setLoadError(null);
              if (video2Ref.current && shouldLoadVideo2) video2Ref.current.load();
            }}
          />
        </div>
      </div>

      {/* Cinematic Welcome to Natdemy Loader */}
      <NatdemyWelcomeLoader
        isLoaded={video1Loaded}
        error={loadError}
        onRetry={() => {
          setLoadError(null);
          if (video1Ref.current) video1Ref.current.load();
        }}
        onStartTour={() => {
          if (video1Ref.current) {
            primeVideo(video1Ref.current, 'part1');
          }
        }}
      />

      {/* Persistent Compact Navigation Bar */}
      <TourNavbar
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying((prev) => !prev)}
        quality={quality}
        onToggleQuality={handleToggleQuality}
      />

      {/* Room Directory & Timeline Modal */}
      <RoomDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        markers={ROOM_TIMELINE}
        activeRoomId={activeMarkers[0]?.id || ''}
        onJumpToRoom={handleJumpToRoom}
      />

      {/* Low-End Hardware Seek Lag Toast */}
      {hasSeekLag && !isAutoPlaying && (
        <div className="fixed top-20 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-fade-in">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-black/90 px-4 py-2 backdrop-blur-xl text-xs font-mono text-amber-200 shadow-2xl">
            <span>Low-power device detected.</span>
            <button
              onClick={() => {
                setQuality('lite');
                setIsAutoPlaying(true);
                setHasSeekLag(false);
              }}
              className="underline font-bold text-white hover:text-amber-300 transition-colors"
            >
              Switch to Auto Walk
            </button>
            <button
              onClick={() => setHasSeekLag(false)}
              className="text-white/40 hover:text-white ml-1.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
