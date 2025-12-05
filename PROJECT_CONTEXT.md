# Particle Morph - Project Context

A real-time interactive 3D particle system with hand gesture controls using Three.js and MediaPipe.

## What It Does

- **3D Particle Shapes**: Morphs between sphere, heart, flower, saturn, buddha, fireworks shapes
- **3D Earth Globe**: Textured Earth with clouds from NASA/Three.js textures
- **Hand Gesture Control**: 
  - Move hand → rotate the 3D object
  - Close fist → expand particles outward
- **Real-time Webcam**: MediaPipe hand tracking (hidden video feed)
- **UI Panel**: Left-side collapsible panel with shape/color selection

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vite** | Build tool & dev server |
| **React 18** | UI framework |
| **Three.js** | 3D rendering |
| **React Three Fiber** | React renderer for Three.js |
| **@react-three/drei** | Three.js helpers (OrbitControls) |
| **@react-three/postprocessing** | Bloom effects |
| **MediaPipe** | Hand landmark detection |
| **shadcn/ui** | UI components (Button, Card, ToggleGroup, Slider) |
| **Tailwind CSS v4** | Styling |
| **Lucide React** | Icons |

## File Structure

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Root component with GestureProvider
├── index.css                   # Tailwind + shadcn/ui CSS variables
│
├── components/
│   ├── Scene.jsx               # Three.js Canvas, camera, lighting, post-processing
│   ├── ParticleSystem.jsx      # 10k particles, shape morphing, gesture response
│   ├── Earth.jsx               # 3D textured globe with clouds
│   ├── HandTracker.jsx         # MediaPipe integration, gesture detection
│   └── UI/
│       └── Overlay.jsx         # Left panel UI (shapes, colors, gestures)
│
├── context/
│   └── GestureContext.jsx      # Global state: tension, position, shape, color
│
├── utils/
│   └── shapes.js               # Point generators for each shape
│
├── components/ui/              # shadcn/ui components
│   ├── button.jsx
│   ├── card.jsx
│   ├── slider.jsx
│   ├── toggle.jsx
│   └── toggle-group.jsx
│
└── lib/
    └── utils.js                # cn() helper for Tailwind classes
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                              │
│                    (GestureProvider)                         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌──────────┐          ┌─────────┐
   │  Scene  │          │HandTracker│          │ Overlay │
   │ (Three) │          │(MediaPipe)│          │  (UI)   │
   └────┬────┘          └────┬─────┘          └────┬────┘
        │                    │                     │
        ▼                    │                     │
┌───────────────┐            │                     │
│ParticleSystem │◄───────────┴─────────────────────┘
│   or Earth    │     (via GestureContext)
└───────────────┘
```

**Data Flow:**
1. `HandTracker` detects hand via webcam → updates `GestureContext`
2. `ParticleSystem` / `Earth` read gesture state each frame → apply rotation/expansion
3. `Overlay` reads/writes shape & color selection → updates context

## Key Components

### GestureContext
```js
{
  tension: 0-1,           // Fist closedness
  isHandDetected: bool,   
  position: { x, y },     // Hand position (-1 to 1)
  currentShape: string,   // 'sphere', 'heart', 'earth', etc.
  particleColor: string   // Hex color
}
```

### ParticleSystem
- 10,000 points with `pointsMaterial`
- Morphs between shape positions via lerp
- Responds to `tension` (expansion) and `position` (rotation)

### Earth
- Textured sphere with NASA textures (loaded from GitHub)
- Cloud layer (separate mesh, rotates slightly faster)
- Smooth lerp interpolation for gesture control

### HandTracker
- Uses `@mediapipe/tasks-vision` HandLandmarker
- Calculates `tension` from fingertip-to-wrist distance
- Calculates `position` from palm center in frame
- Hidden video element (camera feed not visible)

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (localhost:5173)
npm run build      # Production build to /dist
npm run preview    # Preview production build
```

## Vercel Deployment

1. Push to GitHub
2. Import repo in Vercel
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`

No environment variables required.

## UI Enhancements TODO

- [ ] Mobile responsive improvements
- [ ] Touch gesture support
- [ ] Loading state for Earth textures
- [ ] Keyboard shortcuts
- [ ] More shapes
- [ ] Save/share configurations

## Notes

- Bloom post-processing is minimal (threshold 0.8, intensity 0.3) to keep particles sharp
- Particle size is 0.015 for individual visibility
- Earth textures are loaded from Three.js GitHub repo (CORS-friendly)
- Dark theme enabled via `class="dark"` on `<html>` element
