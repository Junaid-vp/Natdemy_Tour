import { RoomMarker, VideoTrackConfig } from '../types/tour';

export const VIDEO_TRACKS: VideoTrackConfig[] = [
  {
    id: 'part1',
    name: 'Exterior & Entrance',
    src: '/videos/office_tour_part1.mp4',
    liteSrc: '/videos/office_tour_part1_lite.mp4',
    poster: '/videos/part1_poster.jpg',
    duration: 31.72,
    scrollMultiplier: 3.5,
  },
  {
    id: 'part2',
    name: 'Headquarters & Studios',
    src: '/videos/office_tour_part2.mp4',
    liteSrc: '/videos/office_tour_part2_lite.mp4',
    poster: '/videos/part2_poster.jpg',
    duration: 86.45,
    scrollMultiplier: 7.5,
  },
];

/**
 * Standard 5 Milestones for the Progress Timeline:
 * START → HEAD OFFICE → STUDIOS → INNOVATION → END
 */
export interface TimelineMilestone {
  id: string;
  label: string;
  videoId: 'part1' | 'part2';
  timestamp: number;
  normalizedProgress: number; // 0 to 1 across entire tour
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: 'start',
    label: 'START',
    videoId: 'part1',
    timestamp: 0.0,
    normalizedProgress: 0.0,
  },
  {
    id: 'head-office',
    label: 'HEAD OFFICE',
    videoId: 'part1',
    timestamp: 29.5,
    normalizedProgress: 29.5 / (31.72 + 86.45), // ~0.2496 (25%)
  },
  {
    id: 'studios',
    label: 'STUDIOS',
    videoId: 'part2',
    timestamp: 16.90,
    normalizedProgress: (31.72 + 16.90) / (31.72 + 86.45), // ~0.4114 (41%)
  },
  {
    id: 'innovation',
    label: 'INNOVATION',
    videoId: 'part2',
    timestamp: 69.45,
    normalizedProgress: (31.72 + 69.45) / (31.72 + 86.45), // ~0.8561 (85.6%)
  },
  {
    id: 'end',
    label: 'END',
    videoId: 'part2',
    timestamp: 85.5,
    normalizedProgress: 1.0,
  },
];

/**
 * Verified Room Markers
 * Small subtle cards displayed strictly on Left or Right edges.
 * No center cards. Essential room name and short category only.
 */
export const ROOM_TIMELINE: RoomMarker[] = [
  // ===================== VIDEO 1: IMG_5621.MOV =====================
  {
    id: 'welcome',
    videoId: 'part1',
    timestamp: 1.0,
    duration: 5.5,
    title: 'WELCOME',
    subtitle: 'Main Campus',
    side: 'center',
    badge: 'CAMPUS',
    verified: true,
  },
  {
    id: 'head-office-entry',
    videoId: 'part1',
    timestamp: 29.5,
    duration: 3.5,
    title: 'HEAD OFFICE',
    subtitle: 'Entrance Foyer',
    side: 'center',
    badge: 'FOYER',
    verified: true,
  },

  // ===================== VIDEO 2: IMG_5622.MOV =====================
  {
    id: 'ceo-office',
    videoId: 'part2',
    timestamp: 8.45,
    duration: 4.5,
    title: 'CEO OFFICE',
    subtitle: 'Executive Suite',
    side: 'left',
    badge: 'EXECUTIVE',
    verified: true,
  },
  {
    id: 'sales-head',
    videoId: 'part2',
    timestamp: 16.90,
    duration: 5.0,
    title: 'SALES HEAD ROOM',
    subtitle: 'Commercial Strategy',
    side: 'left',
    badge: 'MANAGEMENT',
    verified: true,
  },
  {
    id: 'old-studio',
    videoId: 'part2',
    timestamp: 16.90,
    duration: 5.0,
    title: 'OLD STUDIO',
    subtitle: 'Recording Studio A',
    side: 'right',
    badge: 'CREATIVE',
    verified: true,
  },
  {
    id: 'sales-team',
    videoId: 'part2',
    timestamp: 28.32,
    duration: 5.0,
    title: 'SALES TEAM ROOM',
    subtitle: 'Outreach & Growth',
    side: 'left',
    badge: 'COMMERCIAL',
    verified: true,
  },
  {
    id: 'new-studio',
    videoId: 'part2',
    timestamp: 28.32,
    duration: 5.0,
    title: 'NEW STUDIO',
    subtitle: 'Recording Studio B',
    side: 'right',
    badge: 'PRODUCTION',
    verified: true,
  },
  {
    id: 'kitchen',
    videoId: 'part2',
    timestamp: 35.07,
    duration: 4.5,
    title: 'KITCHEN',
    subtitle: 'Breakroom',
    side: 'right',
    badge: 'PANTRY',
    verified: true,
  },
  {
    id: 'vending-machine',
    videoId: 'part2',
    timestamp: 53.19,
    duration: 5.0,
    title: 'VENDING LOUNGE',
    subtitle: 'Refreshments',
    side: 'center',
    badge: 'AMENITY',
    verified: true,
  },
  {
    id: 'faculty-room',
    videoId: 'part2',
    timestamp: 63.70,
    duration: 4.0,
    title: 'FACULTY ROOM',
    subtitle: 'Academic Staff',
    side: 'left',
    badge: 'ACADEMICS',
    verified: true,
  },
  {
    id: 'research-room',
    videoId: 'part2',
    timestamp: 69.45,
    duration: 4.0,
    title: 'RESEARCH ROOM',
    subtitle: 'Innovation Lab',
    side: 'left',
    badge: 'R&D LAB',
    verified: true,
  },
  {
    id: 'meeting-room',
    videoId: 'part2',
    timestamp: 74.46,
    duration: 3.5,
    title: 'MEETING ROOM',
    subtitle: 'Conference Area',
    side: 'left',
    badge: 'MEETING',
    verified: true,
  },
  {
    id: 'channel-room',
    videoId: 'part2',
    timestamp: 78.76,
    duration: 2.5,
    title: 'CHANNEL ROOM',
    subtitle: 'Live Operations',
    side: 'left',
    badge: 'BROADCAST',
    verified: true,
  },
  {
    id: 'media-technical',
    videoId: 'part2',
    timestamp: 80.56,
    duration: 5.0,
    title: 'MEDIA & TECHNICAL',
    subtitle: 'Engineering',
    side: 'center',
    badge: 'INFRASTRUCTURE',
    verified: true,
  },
];
