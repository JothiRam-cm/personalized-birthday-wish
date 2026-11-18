import React, { useMemo } from 'react';

interface FloatingHeartsProps {
  accentColor?: string;
  primaryColor?: string;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  accentColor = '#C8758B',
  primaryColor = '#EFA9B8',
}) => {
  const hearts = useMemo(
    () => [
      { id: 1, left: '6%', size: 15, duration: '17s', delay: '-2s', color: primaryColor },
      { id: 2, left: '16%', size: 11, duration: '21s', delay: '-9s', color: accentColor },
      { id: 3, left: '28%', size: 18, duration: '19s', delay: '-5s', color: primaryColor },
      { id: 4, left: '42%', size: 13, duration: '24s', delay: '-14s', color: '#E8DFF6' },
      { id: 5, left: '58%', size: 16, duration: '18s', delay: '-7s', color: primaryColor },
      { id: 6, left: '72%', size: 12, duration: '22s', delay: '-11s', color: accentColor },
      { id: 7, left: '84%', size: 17, duration: '16s', delay: '-4s', color: primaryColor },
      { id: 8, left: '93%', size: 13, duration: '20s', delay: '-13s', color: '#E4F0E5' },
    ],
    [accentColor, primaryColor]
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      {hearts.map((h) => (
        <svg
          key={h.id}
          viewBox="0 0 24 24"
          width={h.size}
          height={h.size}
          className="absolute animate-float-heart opacity-50"
          style={
            {
              left: h.left,
              '--float-duration': h.duration,
              '--float-delay': h.delay,
            } as React.CSSProperties
          }
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={h.color}
          />
        </svg>
      ))}
    </div>
  );
};
