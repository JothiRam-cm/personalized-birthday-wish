import React, { useMemo } from 'react';
import { BirthdayTheme } from '../types/birthday';
import { FloatingHearts } from './FloatingHearts';

interface AmbientBackgroundProps {
  theme: BirthdayTheme;
  dimmed?: boolean;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  theme,
  dimmed = false,
}) => {
  const sparkles = useMemo(
    () => [
      { id: 's1', top: '14%', left: '12%', size: 12, duration: '4.2s', delay: '0s' },
      { id: 's2', top: '22%', left: '82%', size: 14, duration: '5.1s', delay: '-1.3s' },
      { id: 's3', top: '48%', left: '9%', size: 10, duration: '3.9s', delay: '-2.1s' },
      { id: 's4', top: '66%', left: '88%', size: 13, duration: '4.8s', delay: '-0.8s' },
      { id: 's5', top: '81%', left: '22%', size: 11, duration: '5.5s', delay: '-2.7s' },
      { id: 's6', top: '34%', left: '74%', size: 9, duration: '4.5s', delay: '-1.9s' },
    ],
    []
  );

  const confettiPieces = useMemo(
    () => [
      { id: 'c1', top: '12%', left: '26%', rot: '22deg', color: '#EFA9B8' },
      { id: 'c2', top: '18%', left: '68%', rot: '-18deg', color: '#E8DFF6' },
      { id: 'c3', top: '74%', left: '14%', rot: '38deg', color: '#E4F0E5' },
      { id: 'c4', top: '78%', left: '78%', rot: '-30deg', color: '#FFF8E9' },
      { id: 'c5', top: '55%', left: '92%', rot: '14deg', color: '#EFA9B8' },
    ],
    []
  );

  return (
    <>
      {/* Subtle blush radial gradient wash */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 20% 15%, ${theme.secondaryBackground} 0%, ${theme.background} 55%, ${theme.secondaryBackground} 100%)`,
        }}
        aria-hidden="true"
      />

      <FloatingHearts accentColor={theme.accent} primaryColor={theme.primary} />

      {/* Sparkles & gentle pastel confetti specks */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
        aria-hidden="true"
      >
        {sparkles.map((sp) => (
          <svg
            key={sp.id}
            viewBox="0 0 24 24"
            width={sp.size}
            height={sp.size}
            className="absolute animate-sparkle-twinkle"
            style={
              {
                top: sp.top,
                left: sp.left,
                '--twinkle-duration': sp.duration,
                '--twinkle-delay': sp.delay,
              } as React.CSSProperties
            }
          >
            <path
              d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
              fill={theme.primary}
              opacity="0.65"
            />
          </svg>
        ))}

        {confettiPieces.map((c) => (
          <span
            key={c.id}
            className="absolute w-2.5 h-1.5 rounded-full opacity-55"
            style={{
              top: c.top,
              left: c.left,
              backgroundColor: c.color,
              transform: `rotate(${c.rot})`,
              border: '1px solid rgba(200,117,139,0.2)',
            }}
          />
        ))}
      </div>

      {/* Candle wish evening dimmer */}
      <div
        className={`fixed inset-0 pointer-events-none z-10 transition-opacity duration-700 ${
          dimmed ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(45, 24, 34, 0.34) 0%, rgba(30, 15, 22, 0.62) 100%)',
        }}
        aria-hidden="true"
      />
    </>
  );
};
