# Interactive Personalized Birthday Wish

A responsive, kawaii-romantic seven-stage interactive birthday storybook built with **React**, **TypeScript**, **Three.js**, **Framer Motion**, **Tailwind CSS**, and **Google Drive** integration.

## Features

1. **Stage 1 — Birthday Welcome Screen**: Handwritten greeting, pastel bunting banner, cute brown bear & white bunny celebrating around a cake, playful **Yes / No** prompt.
2. **Stage 2 — Pop the Balloons (3D)**: Four interactive Three.js pastel balloons (`YOU ARE SO SPECIAL`) with particle burst pops and accessible keyboard support.
3. **Stage 3 — Blow the Birthday Candle (3D)**: Composite Three.js birthday cake with flickering candle flame, opt-in Web Audio API microphone blow detection, universal **Tap to blow** fallback, rising smoke, and dimmed wish reveal.
4. **Stage 4 — The Rose Bouquet**: Illustrated red rose bouquet with cream paper and dusty-red ribbon paired with sequential message bubbles.
5. **Stage 5 — A Message From My Heart**: Cream champagne-gold envelope with 3D flap animation opening to reveal a progressively animated ivory letter card.
6. **Stage 6 — One Last Thing (3D)**: Interactive Three.js pastel gift box whose lid springs open in a burst of confetti and sparkles.
7. **Stage 7 — Final Birthday Reveal**: Celebratory bear & bunny scene, optional keepsake photo memories, **Replay** reset, Web Share / copy-link sharing, and downloadable PNG **QR Code**.

---

## How to Personalize

### Option A: In-App Customize Drawer
Click **Customize** in the top-right corner of the app to edit:
- Recipient name, sender name, and welcome greeting
- Balloon reveal words and rose bouquet message bubbles
- Heartfelt letter greeting and multi-paragraph body
- Pastel theme presets
- Local or Google Drive keepsake photos
- Save and load personalized birthday wish packages in **Google Drive**

### Option B: Edit the Central Configuration File
Open `src/config/birthdayConfig.ts` and update `defaultBirthdayConfig`:

```ts
export const defaultBirthdayConfig: BirthdayConfig = {
  recipientName: 'Samyuuu',
  senderName: 'Your Special Someone',
  theme: {
    background: '#FFF7F8',
    secondaryBackground: '#FFF1F4',
    primary: '#EFA9B8',
    accent: '#C8758B',
    deepAccent: '#914B61',
  },
  greeting: 'Happy Birthday',
  balloonWords: ['YOU', 'ARE', 'SO', 'SPECIAL'],
  bouquetMessages: [
    'You make my world beautiful.',
    'Happy Birthday, {name} ❤️',
  ],
  letter: {
    heading: 'A Message From My Heart',
    greeting: 'Dear {name} 🎀 💗,',
    body: DEFAULT_LETTER_BODY,
  },
  finalMessage: 'Lots of love for you ❤️',
  keepsakePhotos: [],
  enableMicrophone: true,
  enableMusic: false,
  enableSharing: true,
};
```

Placeholders `{name}` and `{sender}` are automatically replaced across all stages.

---

## Local Setup & Build

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Deployment (Vercel / Netlify)

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **SPA Routing**: Static hosting serves `index.html` cleanly with URL hash sharing (`#wish=...`) so personalized links work without extra server configuration.
