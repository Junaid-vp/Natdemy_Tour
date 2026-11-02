# Natdemy — Cinematic Mobile-First Office Tour

A production-quality, mobile-first virtual walkthrough website powered by real recorded office footage, synchronized frame-by-frame with user scroll.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- pnpm or npm

### Development
```bash
pnpm install
pnpm dev
```
Runs the development server with Hot Module Replacement (HMR) at `http://localhost:3000`.

### Production Build & Preview
```bash
pnpm build
pnpm preview
```
Builds the optimized production bundle with TypeScript type-checking and opens the preview server at `http://localhost:4173`.

---

## 🎥 Video Optimization & Pipeline

The raw source recordings were high-bitrate iPhone HEVC Dolby Vision `.MOV` files:
- `IMG_5621.MOV` (Part 1): 58.55 MB, 10-bit HEVC (15.5 Mbps)
- `IMG_5622.MOV` (Part 2): 194.46 MB, 10-bit HEVC (18.9 Mbps)
- Total source payload: **> 253 MB**

### Web & Mobile Optimization Strategy
1. **H.264 & YUV420P**: Transcoded to standard 8-bit `yuv420p` H.264 (`libx264`), ensuring universal hardware-accelerated playback across mobile Safari (iOS), Chrome (Android), Firefox, Edge, and desktop browsers without washed-out HDR colors.
2. **Ultra-Short Keyframe Spacing (GOP = 6 / ~0.2s)**: Setting `-g 6 -keyint_min 6` places a complete keyframe every 0.2 seconds. When the user scrubs up or down, the browser's video decoder only ever needs to decode at most 5 frames to render any requested position, eliminating seek lag, dropped frames, and decoding stalls.
3. **Web Fast-Start Metadata (`+faststart`)**: Moves the MP4 `moov` index atom to the very beginning of the file, allowing immediate frame seeking without having to download the entire video.
4. **Optimized HD Portrait Stream (720x1280)**: Native 9:16 portrait resolution matches mobile screen form factors perfectly (retina-crisp on phones without GPU memory strain).
5. **Stripped Audio (`-an`)**: Tour audio is decoupled from scrubbing, reducing unnecessary bandwidth.

### Final Results
| Asset | Source Size | Optimized Size | Reduction | GOP (Keyframe) |
|---|---|---|---|---|
| Part 1 (`office_tour_part1.mp4`) | 58.55 MB | **9.1 MB** | **-84.5%** | 6 frames (0.2s) |
| Part 2 (`office_tour_part2.mp4`) | 194.46 MB | **20.0 MB** | **-89.7%** | 6 frames (0.2s) |
| **Total Media Payload** | **253.01 MB** | **29.1 MB** | **-88.5%** | |

*Note: The original source files `IMG_5621.MOV` and `IMG_5622.MOV` remain preserved and unmodified.*

---

## ⚡ Core Engineering & Architecture

### 1. True Scroll-Synchronized Video Scrubbing (`useScrollVideoScrubber`)
- Normalized scroll position ($P \in [0, 1]$) is mapped linearly to video duration ($t = P \times D$).
- **RAF Scheduling & Seek Coalescing**: Raw scroll events do not directly mutate `video.currentTime`. Updates are scheduled on `requestAnimationFrame` and coalesced so rapid scroll events never flood the decoder.
- **In-Flight Seek Guard**: If `video.seeking` is true, intermediate seek requests are queued (`pendingTargetTime.current`), and the latest target time is dispatched on the native `seeked` event.
- **Bi-directional Scrubbing**: Scrolling upward moves video time backward cleanly without video pipeline stall.

### 2. Multi-Video Lazy Loading & Seamless Transition
- **Video 1 (Exterior & Entrance)** loads immediately.
- **Video 2 (Headquarters & Studios)** is lazily prepared: preloading begins automatically at 12% scroll depth, long before Video 1 finishes.
- **Visual Match Cut**: Video 1 ends right in front of the head office entrance door on the blue diamond welcome mat. Video 2 begins stepping on the exact same mat through the door. A subtle ambient crossfade and transition banner bridges the two clips naturally.

### 3. Dual Simultaneous Room Labels & Timeline
Configured in `src/config/tourTimeline.ts`:
- **Dual Labeling**: At timestamps with parallel rooms across the hallway (e.g., `00:16.90`: *Sales Head Room* on Left, *Old Studio* on Right; and `00:28.32`: *Sales Team Room* on Left, *New Studio* on Right), both labels are displayed simultaneously on their respective screen sides without obstructing the central hallway view.
- **Verified Room Timestamps**:
  - `00:01.00`: Welcome to Our Company (Exterior Campus)
  - `00:29.50`: Head Office (Entrance Foyer)
  - `00:08.45`: CEO Office (Left)
  - `00:16.90`: Sales Head Room (Left) & Old Studio (Right)
  - `00:28.32`: Sales Team Room (Left) & New Studio (Right)
  - `00:35.07`: Kitchen & Breakroom (Right)
  - `00:53.19`: Vending & Cafe Lounge (Center)
  - `01:03.70`: Faculty Room (Left)
  - `01:09.45`: Research Room (Center)
  - `01:14.46`: Meeting Room (Center)
  - `01:18.76`: Channel Room (Right)
  - `01:20.56`: Media & Technical (Right)

### 4. Usability & Accessibility
- **Auto Walk Mode**: Hands-free playback mode for users who prefer guided viewing or cannot scrub.
- **Room Index Directory Modal**: One-click jump to any of the 12 rooms with descriptions and timestamps.
- **Keyboard Navigation**: Up/Down arrow keys, J/K keys, and Spacebar (toggle Auto Walk).
- **Reduced Motion Support**: Respects `prefers-reduced-motion` media queries.
- **Desktop Adaptation**: Centered portrait cinema frame with subtle ambient glow, preventing awkward horizontal stretching.

---

## 📁 Project Structure

```
├── public/
│   ├── favicon.svg
│   └── videos/
│       ├── office_tour_part1.mp4   # Optimized Part 1 (720x1280, GOP 6)
│       ├── office_tour_part2.mp4   # Optimized Part 2 (720x1280, GOP 6)
│       ├── part1_poster.jpg        # Video 1 poster
│       └── part2_poster.jpg        # Video 2 poster
├── src/
│   ├── config/
│   │   └── tourTimeline.ts         # Centralized room timestamps & metadata
│   ├── types/
│   │   └── tour.ts                 # TypeScript type definitions
│   ├── hooks/
│   │   └── useScrollVideoScrubber.ts# High-performance RAF seeking engine
│   ├── components/
│   │   ├── CompanyTourPage.tsx     # Master tour layout & virtual scroll container
│   │   ├── TourNavbar.tsx          # Minimal top navigation & controls
│   │   ├── RoomLabelOverlay.tsx    # Left/Right/Center synchronized room cards
│   │   ├── TourProgressIndicator.tsx # Bottom chapter timeline & progress bar
│   │   ├── VideoTransitionOverlay.tsx # Seamless bridge between Video 1 & 2
│   │   ├── RoomDirectoryModal.tsx  # Quick jump drawer for all 12 rooms
│   │   └── VideoLoadingState.tsx   # Loading spinner & playback fallback
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                   # Tailwind CSS & keyframes
├── IMG_5621.MOV                    # Original source footage 1 (unmodified)
├── IMG_5622.MOV                    # Original source footage 2 (unmodified)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

