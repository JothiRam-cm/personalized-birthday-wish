# Personalized Seven-Stage 3D Birthday Wish Experience

An interactive, kawaii-romantic seven-stage digital birthday storybook that opens directly into the celebration with tactile Three.js 3D props, microphone and tap-friendly candle blowing, a progressive heartfelt letter, and Google Drive persistence for saving and loading personalized wishes and keepsake photos.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Phase 1 Confirmed Decisions & Integration Setup**
> - **Three.js 3D Integration**: Interactive composite 3D props are embedded directly into key tactile stages—**Pop the Balloons (Stage 2)**, **Blow the Birthday Candle (Stage 3)**, and **One Last Thing Gift Box (Stage 6)**—while preserving the soft pastel storybook aesthetic across all seven stages.
> - **Google Drive Persistence**: Users can sign in with Google inside the Customize drawer to save/load personalized birthday wish packages (configuration + metadata) and upload or import keepsake photos in Google Drive.
> - **Entry & Editing Experience**: The app opens directly into **Stage 1 (Birthday Welcome Screen)** for immediate emotional impact, paired with a discreet, collapsible **Customize & Drive** drawer so the sender can tailor names, messages, keepsake photos, and sharing links without cluttering the recipient's view.
> - **Google Drive Authorization (Next Step After Approval)**: Enabling Google Drive requires setting up Google Workspace permissions (`drive.file` for app-managed wish packages and keepsake uploads, plus `drive.readonly` for browsing existing Drive photos). Upon plan approval, the first setup step will prompt you to review and confirm that connection.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a sequential, single-viewport-at-a-time seven-stage birthday journey (`Welcome` → `Pop 4 Balloons` → `Blow the Candle` → `Rose Bouquet` → `Heartfelt Letter` → `Gift Box Reveal` → `Final Celebration`) driven by a centralized personalization model, interactive 3D WebGL objects, ambient floating particles, and optional Google Drive cloud saves.
- **Target Audience & Context**: Senders crafting a thoughtful, bespoke digital surprise for a loved one (defaulting to a sample recipient such as *"Samyuuu"* until customized), and recipients experiencing the gift across mobile phones, tablets, or desktop browsers.
- **Key Value**: Combines the emotional warmth of a hand-illustrated kawaii greeting card with tactile 3D interactions, optional microphone breath detection, and real Google Drive storage so wishes and cherished photos can be saved, reopened, and shared effortlessly.

---

## 2. User Experience & Visual Design

### Key User Flows (Seven Sequential Stages + Customize Drawer)

1. **Stage 1 — Birthday Welcome Screen**: Full-screen pale blush canvas with subtle drifting hearts, sparkles, and pastel confetti. Displays the handwritten greeting (*"Happy Birthday, [Recipient] 🎀 💗"*), decorative bunting banner, consistent illustrated brown teddy bear and white bunny celebrating around a *"HAPPY BIRTHDAY"* cake, and *"Are you excited for what's next?"* with **Yes** (confetti burst → Stage 2) and **No** (affectionate playful nudge allowing retry without blocking).
2. **Stage 2 — Pop the Balloons**: Centered 2 × 2 Three.js 3D pastel balloon showcase (pastel pink, sky blue, lavender, mint) with satin sheen, knotted bases, swaying ribbon strings, and soft shadows. Clicking or tapping a 3D balloon (or triggering its accessible keyboard card button) scales and pops it into a particle burst, progressively revealing `"YOU"`, `"ARE"`, `"SO"`, `"SPECIAL"`. Once all four pop, confetti triggers, the full sentence displays, and **Continue** unlocks.
3. **Stage 3 — Blow the Birthday Candle**: Centered Three.js 3D birthday cake with frosted drip layers, festive sprinkles, upright striped candle, flickering flame shader, and warm dynamic light. Supports both **Microphone Blow Detection** (user-initiated Web Audio API volume-threshold detection with immediate stream shutdown and zero recording/storage) and a universal **"Tap to blow"** fallback. Extinguishing the flame triggers rising 3D smoke wisps, dims the scene into a serene wish state (*"Close your eyes & make a wish ✨"*), and reveals **Make a Wish**, which sparkles, restores lighting, and unlocks **Continue**.
4. **Stage 4 — The Rose Bouquet**: Spacious pale pink composition pairing a balanced red rose bouquet illustration (cream wrapping paper, dusty-red ribbon, layered petals) with sequentially animating rounded message bubbles (*"You make my world beautiful."* and *"Happy Birthday, [Recipient] ❤️"*), stacking gracefully on mobile before **Continue**.
5. **Stage 5 — A Message From My Heart**: Centered cream envelope with champagne-gold outline and `"TAP TO OPEN"` prompt. Tapping rotates the 3D-transformed flap open and slides out an ivory/mint letter card adorned with a corner heart and miniature bear-bunny motif, revealing `"Dear [Recipient] 🎀 💗,"` and the editable multi-paragraph letter progressively before unlocking **One Last Surprise**.
6. **Stage 6 — One Last Thing**: Centered Three.js 3D pastel pink gift box with cross-ribbons and multi-loop bow bobbing gently in studio light. Tapping bounces the box, springs the lid open, unleashes a burst of pastel confetti, hearts, and sparkles, and transitions smoothly to the finale.
7. **Stage 7 — Final Birthday Reveal**: Returns to the warm blush celebration atmosphere with *"Lots of love for you ❤️"*, the celebratory bear-and-bunny cake & gifts illustration, optional keepsake photo strip (if keepsake photos are attached), and *"Once Again, Happy Birthday [Recipient] 🎀 💗"*. Includes **Replay** (resets all stage and interaction states back to Stage 1), **Share this birthday surprise** (Web Share API + copy-link fallback), and an optional QR code modal with PNG download.
8. **Discreet Customize & Google Drive Drawer**: Accessible from a quiet top-corner control without disturbing the card atmosphere. Lets the user edit recipient/sender names, greetings, balloon words, bouquet bubbles, letter copy, theme accents, gentle synthesized Web Audio birthday chime toggle, keepsake photo attachments, shareable URL / QR preview, and **Google Drive Sync** (Sign in with Google, save current wish package to Drive, load saved wishes from Drive, upload/import keepsake photos, or delete saved wishes after explicit confirmation).

### Visual Identity & Theme

- **Aesthetic Direction**: Kawaii + Romantic + Pastel + Minimalist + Interactive—crafted like a bespoke illustrated storybook card rather than a SaaS dashboard. Zero pill-badge clutter, zero mechanical prefixes, and clean single-line controls.
- **Color Palette & Tokens**:
  - Primary Canvas (`--background`): `#FFF7F8` (pale blush pink)
  - Secondary Surface (`--surface-secondary`): `#FFF1F4`
  - Primary Accent (`--primary`): `#EFA9B8` (soft rose pink)
  - Dusty Rose (`--accent`): `#C8758B`
  - Deep Rose (`--accent-deep`): `#914B61`
  - Primary Ink (`--text-primary`): `#684650`
  - Muted Ink (`--text-secondary`): `#A27B84`
  - Pastel Supports: Soft Lavender `#E8DFF6`, Soft Mint `#E4F0E5`, Warm Cream `#FFF8E9`, Hairline Border `#EED8DE`, Crisp White `#FFFFFF`
- **Typography & Hierarchy**:
  - *Display / Affectionate Headings*: `Dancing Script` (handwritten warmth, `clamp(2.25rem, 4.5vw, 3.75rem)`, `text-wrap: balance`)
  - *Section Headings*: `Playfair Display` (editorial serif elegance, 20px–34px)
  - *Body & Controls*: `Nunito` (rounded, gentle, legible 15px–16px prose and accessible buttons)
- **3D & Motion Discipline**:
  - Composite 3–12 part procedural 3D models (`THREE.Group`) with `RoomEnvironment` IBL reflections, warm directional key light + cool hemisphere fill, soft radial contact shadows, `ACESFilmicToneMapping`, and smooth exponential damping (`1 - Math.exp(-k * dt)`).
  - Full `prefers-reduced-motion` support across CSS, Framer Motion transitions (400–700 ms stage fades), and 3D idle animations.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Targeted Interactive 3D Props vs. Single Full-Screen 3D World**
  - *Chosen Approach*: Mount dedicated Three.js stage viewports for Stages 2, 3, and 6 inside stable React `useRef` containers while rendering cohesive bespoke pastel vector illustrations for the bear, bunny, rose bouquet, and envelope stages.
  - *Why*: Preserves razor-sharp 2D character charm and effortless letter legibility while making the three physical interaction moments (popping balloons, blowing out the candle, opening the gift) genuinely tactile and spatial.
  - *Alternatives Considered*: Building a full 3D environment for all 7 stages risks visual fatigue, slower mobile load times, and reduced readability on the long-form letter stage.

- **Decision 2 — Software-WebGL Resilient Rendering & Zero-404 Procedural Assets**
  - *Chosen Approach*: Probe the WebGL renderer string at runtime (`isSoftwareGl`) strictly to tune pixel ratio, antialiasing, shadows, and `afterDraw` frame pacing while keeping scene geometry, lighting intensities, and layout identical; generate all 3D textures (icing patterns, wax stripes, satin ribbon weaves) procedurally via HTML5 Canvas.
  - *Why*: Guarantees smooth responsiveness and zero broken external textures across GPU devices, mobile phones, and software-rendered headless environments.
  - *Alternatives Considered*: Loading external `.hdr` or `.png` textures risks 404 failures or stalls on slow networks.

- **Decision 3 — Google Drive Persistence & Client-Side Auth Pattern**
  - *Chosen Approach*: Use Firebase Auth (`GoogleAuthProvider`) with in-memory OAuth access token caching (never persisted to `localStorage`/`sessionStorage`) and direct Drive REST v3 API calls (`drive.file` + `drive.readonly`) to store birthday wish JSON packages and keepsake images in an app-managed *"Birthday Wishes"* folder, paired with explicit React confirmation dialogs before overwriting or deleting any existing Drive file.
  - *Why*: Works reliably in dynamic preview environments without server-side OAuth redirect mismatches, honors user data safety, and lets users carry personalized wishes and photos across devices.
  - *Alternatives Considered*: Storing only in browser `localStorage` loses wishes when switching devices; server-side OAuth code flows break under ephemeral preview URLs.

- **Decision 4 — Universal Accessibility for Candle Blowing & Stage Controls**
  - *Chosen Approach*: Keep microphone access strictly opt-in (started only on user click, stopped immediately on extinguish/unmount, never recorded or uploaded) alongside a prominent `"Tap to blow"` button, plus semantic DOM buttons paired with 3D raycasting for balloons and gift interaction.
  - *Why*: Ensures 100% completion on devices without microphones, in quiet rooms, or with screen readers/keyboard navigation.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Central Personalization & Flow Layer                 │
│  BirthdayConfig (Recipient, Messages, Theme, Letter, Keepsake Photos)   │
│  + Flow State (StageId: welcome..final, Popped[4], Candle, Wish, Gift)  │
└───────────────┬─────────────────────────────────────────┬───────────────┘
                │                                         │
                ▼                                         ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│   Seven-Stage Story Viewport  │         │  Customize & Drive Drawer     │
│                               │         │                               │
│  [1] Welcome (Bear & Bunny)   │         │  • Edit Names, Words, Letter  │
│  [2] Balloons (Three.js 3D)   │         │  • Keepsake Photo Manager     │
│  [3] Candle Cake (Three.js 3D │         │  • Music Synth Toggle         │
│      + Web Audio Mic / Tap)   │         │  • Share Link & QR Code PNG   │
│  [4] Rose Bouquet & Bubbles   │         │  • Google Sign-In & Drive API │
│  [5] Envelope & Letter Card   │         │    (Save/Load Wishes & Photos │
│  [6] Gift Box (Three.js 3D)   │         │     with Confirm Modals)      │
│  [7] Final Reveal & Replay    │         └───────────────┬───────────────┘
└───────────────┬───────────────┘                         │
                │                                         ▼
                ▼                         ┌───────────────────────────────┐
┌───────────────────────────────┐         │  Google Workspace & Auth      │
│  Shared Ambient & FX Layer    │         │  Firebase Auth Popup ->       │
│  • Floating Hearts & Sparkles │         │  In-Memory Token Cache ->     │
│  • Canvas Confetti Bursts     │         │  Drive v3 REST (Wishes/Media) │
│  • Web Audio Soft Chimes      │         └───────────────────────────────┘
└───────────────────────────────┘
```

### Data Model & State

- **Central Configuration (`BirthdayConfig`)**: Holds `recipientName`, `senderName`, `theme` (`background`, `primary`, `accent`, etc.), `greeting`, `balloonWords` (4 strings), `bouquetMessages` (2 strings), `letter` (`heading`, `greeting`, `body`), `finalMessage`, `keepsakePhotos` (array of photo metadata/data/Drive image references), and feature toggles (`enableMicrophone`, `enableMusic`, `enableSharing`). Also supports compact URL hash / query hydration for shared links alongside Google Drive wish files.
- **Flow & Interaction State (`BirthdayFlowState`)**: Tracks `currentStage` (`welcome | balloons | candle | bouquet | letter | gift | final`), `poppedBalloons` (`boolean[4]`), `candleExtinguished`, `wishMade`, `envelopeOpened`, `letterCompleted`, and `giftOpened`. Triggering **Replay** resets all interaction flags cleanly and returns to `welcome`.
- **Auth & Drive State**: Tracks authenticated Google `user`, in-memory `accessToken`, `needsAuth`, saved Drive wish list, Drive photo browser items, loading/error states, and active confirmation modal state for any overwrite or delete action.

### Interactive Component & State Mapping

- **Three.js Prop Viewports (Stages 2, 3, 6)**: Each 3D stage mounts an isolated `<div ref={mountRef}>` canvas with `RoomEnvironment` reflections, 3-point warm/cool studio lighting, soft radial contact shadows, pointer raycasting (`pointerdown`/`pointermove` throttled), `webglcontextlost` recovery fallback, and `dispose()` cleanup on stage exit. Interactive DOM controls overlay cleanly without `backdrop-filter` over WebGL.
- **Web Audio Microphone Detector**: Requests `navigator.mediaDevices.getUserMedia({ audio: true })` only when the user clicks *"Use Microphone"*, computes RMS/low-frequency energy via `AnalyserNode`, fires the extinguish callback once sustained blowing exceeds threshold, and immediately stops all `MediaStreamTrack` instances and closes the `AudioContext`.
- **Google Drive Sync Service**: Searches/creates an app folder (`Birthday Wishes`), serializes `BirthdayConfig` as JSON (`drive.file`), uploads/imports keepsake images, fetches thumbnails/media blobs using `Authorization: Bearer <token>`, and gates any `PATCH` overwrite or `DELETE` call behind a clear confirmation dialog naming the target wish or file.
