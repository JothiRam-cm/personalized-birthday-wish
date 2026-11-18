import confetti from 'canvas-confetti';

const PASTEL_CONFETTI_COLORS = [
  '#EFA9B8',
  '#C8758B',
  '#E8DFF6',
  '#E4F0E5',
  '#FFF8E9',
  '#F9D5DE',
];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function triggerPastelConfetti(intensity: 'gentle' | 'burst' = 'gentle') {
  if (prefersReducedMotion()) return;

  if (intensity === 'gentle') {
    void confetti({
      particleCount: 42,
      spread: 68,
      origin: { y: 0.65 },
      colors: PASTEL_CONFETTI_COLORS,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
    return;
  }

  void confetti({
    particleCount: 70,
    angle: 60,
    spread: 60,
    origin: { x: 0.15, y: 0.65 },
    colors: PASTEL_CONFETTI_COLORS,
    disableForReducedMotion: true,
  });

  void confetti({
    particleCount: 70,
    angle: 120,
    spread: 60,
    origin: { x: 0.85, y: 0.65 },
    colors: PASTEL_CONFETTI_COLORS,
    disableForReducedMotion: true,
  });
}

export function triggerSparkleBurst() {
  if (prefersReducedMotion()) return;
  void confetti({
    particleCount: 50,
    spread: 85,
    startVelocity: 28,
    ticks: 90,
    origin: { y: 0.52 },
    colors: ['#FFF8E9', '#F6D365', '#EFA9B8', '#E8DFF6'],
    shapes: ['star', 'circle'],
    scalar: 0.95,
    disableForReducedMotion: true,
  });
}
