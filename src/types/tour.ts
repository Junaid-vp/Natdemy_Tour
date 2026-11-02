export type RoomSide = 'left' | 'right' | 'center' | 'fullscreen';

export interface RoomMarker {
  id: string;
  videoId: 'part1' | 'part2';
  timestamp: number; // in seconds relative to current video
  duration?: number; // duration in seconds this marker remains active/visible
  title: string;
  subtitle?: string;
  description?: string;
  side: RoomSide;
  badge?: string;
  verified?: boolean;
}

export interface VideoTrackConfig {
  id: 'part1' | 'part2';
  name: string;
  src: string;
  liteSrc?: string;
  poster: string;
  duration: number; // in seconds
  scrollMultiplier?: number; // how many viewport heights of scroll per track
}

export interface TourState {
  currentTrackId: 'part1' | 'part2';
  currentTrackIndex: number;
  trackProgress: number; // 0 to 1 within current track
  totalProgress: number; // 0 to 1 across entire tour
  currentTime: number; // seconds within current track
  isSeeking: boolean;
  isBuffering: boolean;
  activeMarkers: RoomMarker[];
  isTransitioning: boolean;
}

