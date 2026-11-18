import React from 'react';

interface BirthdayBuntingProps {
  primaryColor?: string;
  accentColor?: string;
}

export const BirthdayBunting: React.FC<BirthdayBuntingProps> = ({
  primaryColor = '#EFA9B8',
  accentColor = '#C8758B',
}) => {
  const flagColors = [
    primaryColor,
    '#E8DFF6',
    '#FFF8E9',
    '#E4F0E5',
    '#F9D5DE',
    accentColor,
    '#E8DFF6',
    primaryColor,
  ];

  return (
    <svg
      viewBox="0 0 420 56"
      className="w-full max-w-[360px] mx-auto overflow-visible select-none"
      aria-hidden="true"
    >
      <path
        d="M 10 8 Q 210 34 410 8"
        fill="none"
        stroke="#C8758B"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {flagColors.map((fill, idx) => {
        const t = (idx + 0.5) / flagColors.length;
        const x = 18 + t * 384;
        const curveY = 8 + 4 * t * (1 - t) * 14;
        const tilt = (t - 0.5) * -14;
        return (
          <g
            key={idx}
            transform={`translate(${x}, ${curveY}) rotate(${tilt})`}
          >
            <polygon
              points="-15,0 15,0 0,28"
              fill={fill}
              stroke="#EED8DE"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="9" r="2.2" fill="#FFFFFF" opacity="0.7" />
          </g>
        );
      })}
    </svg>
  );
};

interface BirthdayIllustrationProps {
  variant?: 'welcome' | 'final' | 'mini';
  className?: string;
}

export const BirthdayIllustration: React.FC<BirthdayIllustrationProps> = ({
  variant = 'welcome',
  className = '',
}) => {
  if (variant === 'mini') {
    return (
      <svg
        viewBox="0 0 120 72"
        className={`w-24 h-14 select-none ${className}`}
        aria-label="Cute bear and bunny celebrating"
      >
        {/* Mini brown bear */}
        <g transform="translate(32, 38)">
          <circle cx="-11" cy="-14" r="6" fill="#C69573" />
          <circle cx="11" cy="-14" r="6" fill="#C69573" />
          <circle cx="-11" cy="-14" r="3.2" fill="#F4C7CF" />
          <circle cx="11" cy="-14" r="3.2" fill="#F4C7CF" />
          <ellipse cx="0" cy="0" rx="16" ry="14" fill="#D5A684" />
          <ellipse cx="0" cy="4" rx="7" ry="5.5" fill="#FFF3E8" />
          <circle cx="-5.5" cy="-2" r="1.8" fill="#5A3A31" />
          <circle cx="5.5" cy="-2" r="1.8" fill="#5A3A31" />
          <ellipse cx="0" cy="2.5" rx="2.4" ry="1.7" fill="#684650" />
          <circle cx="-9" cy="2" r="2.6" fill="#F29DB1" opacity="0.55" />
          <circle cx="9" cy="2" r="2.6" fill="#F29DB1" opacity="0.55" />
          {/* Tiny party hat */}
          <polygon points="-6,-13 6,-13 0,-26" fill="#EFA9B8" />
          <circle cx="0" cy="-27" r="2.4" fill="#FFF8E9" />
        </g>

        {/* Mini white bunny */}
        <g transform="translate(86, 38)">
          <ellipse cx="-6" cy="-21" rx="4.2" ry="12" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="1.2" />
          <ellipse cx="6" cy="-21" rx="4.2" ry="12" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="1.2" />
          <ellipse cx="-6" cy="-21" rx="2.1" ry="7.5" fill="#F8CCD7" />
          <ellipse cx="6" cy="-21" rx="2.1" ry="7.5" fill="#F8CCD7" />
          <ellipse cx="0" cy="0" rx="15" ry="13.5" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="1.3" />
          <circle cx="-5.5" cy="-2" r="1.8" fill="#5A3A31" />
          <circle cx="5.5" cy="-2" r="1.8" fill="#5A3A31" />
          <ellipse cx="0" cy="2" rx="2.1" ry="1.5" fill="#EFA9B8" />
          <circle cx="-9" cy="2" r="2.6" fill="#F29DB1" opacity="0.5" />
          <circle cx="9" cy="2" r="2.6" fill="#F29DB1" opacity="0.5" />
          {/* Tiny party hat */}
          <polygon points="-5,-12 5,-12 0,-23" fill="#E8DFF6" />
          <circle cx="0" cy="-24" r="2.2" fill="#FFF8E9" />
        </g>

        {/* Tiny heart in middle */}
        <path
          d="M60 22c-1.8-3.4-6.8-3-6.8 1.2 0 3.6 6.8 7.8 6.8 7.8s6.8-4.2 6.8-7.8c0-4.2-5-4.6-6.8-1.2z"
          fill="#C8758B"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 460 290"
      className={`w-full max-w-[430px] h-auto mx-auto select-none ${className}`}
      role="img"
      aria-label="Cute brown bear and white bunny wearing party hats celebrating with a birthday cake"
    >
      <defs>
        <radialGradient id="stageShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8758B" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C8758B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cakeFrosting" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF0F4" />
        </linearGradient>
      </defs>

      {/* Ground contact shadow */}
      <ellipse cx="230" cy="260" rx="185" ry="18" fill="url(#stageShadow)" />

      {/* Decorative pastel stars, flowers & hearts */}
      <g opacity="0.9">
        <path
          d="M52 72 L55 81 L64 84 L55 87 L52 96 L49 87 L40 84 L49 81 Z"
          fill="#F9D5DE"
        />
        <path
          d="M406 64 L409 72 L417 75 L409 78 L406 86 L403 78 L395 75 L403 72 Z"
          fill="#E8DFF6"
        />
        <path
          d="M230 34c-3-5.6-11-5-11 2 0 5.8 11 12.6 11 12.6s11-6.8 11-12.6c0-7-8-7.6-11-2z"
          fill="#EFA9B8"
        />
        {/* Little daisy left */}
        <g transform="translate(56, 224)">
          <circle cx="0" cy="-6" r="4" fill="#FFFFFF" />
          <circle cx="6" cy="0" r="4" fill="#FFFFFF" />
          <circle cx="0" cy="6" r="4" fill="#FFFFFF" />
          <circle cx="-6" cy="0" r="4" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="3.5" fill="#F9D976" />
        </g>
        {/* Little daisy right */}
        <g transform="translate(402, 222)">
          <circle cx="0" cy="-6" r="4" fill="#E8DFF6" />
          <circle cx="6" cy="0" r="4" fill="#E8DFF6" />
          <circle cx="0" cy="6" r="4" fill="#E8DFF6" />
          <circle cx="-6" cy="0" r="4" fill="#E8DFF6" />
          <circle cx="0" cy="0" r="3.5" fill="#F9D976" />
        </g>
      </g>

      {/* LEFT CHARACTER: Adorable Brown Teddy Bear */}
      <g transform="translate(115, 168)">
        {/* Body */}
        <ellipse cx="0" cy="38" rx="42" ry="44" fill="#CE9A77" />
        <ellipse cx="0" cy="42" rx="26" ry="28" fill="#FBEADB" />
        {/* Little feet */}
        <ellipse cx="-24" cy="76" rx="15" ry="11" fill="#C18A67" />
        <ellipse cx="24" cy="76" rx="15" ry="11" fill="#C18A67" />
        <ellipse cx="-24" cy="76" rx="8" ry="5.5" fill="#F4C7CF" />
        <ellipse cx="24" cy="76" rx="8" ry="5.5" fill="#F4C7CF" />
        {/* Arms waving warmly */}
        <ellipse
          cx="-40"
          cy="22"
          rx="13"
          ry="21"
          transform="rotate(28 -40 22)"
          fill="#CE9A77"
        />
        <ellipse
          cx="40"
          cy="24"
          rx="13"
          ry="21"
          transform="rotate(-32 40 24)"
          fill="#CE9A77"
        />
        {/* Bear ears */}
        <circle cx="-30" cy="-42" r="16" fill="#C18A67" />
        <circle cx="30" cy="-42" r="16" fill="#C18A67" />
        <circle cx="-30" cy="-42" r="8.5" fill="#F5C6D1" />
        <circle cx="30" cy="-42" r="8.5" fill="#F5C6D1" />
        {/* Bear head */}
        <ellipse cx="0" cy="-14" rx="44" ry="38" fill="#D8A785" />
        {/* Muzzle */}
        <ellipse cx="0" cy="-3" rx="17" ry="13" fill="#FFF3E9" />
        {/* Rosy cheeks */}
        <ellipse cx="-24" cy="-5" rx="7.5" ry="4.5" fill="#F29CB0" opacity="0.55" />
        <ellipse cx="24" cy="-5" rx="7.5" ry="4.5" fill="#F29CB0" opacity="0.55" />
        {/* Eyes with bright catchlights */}
        <circle cx="-15" cy="-16" r="4.2" fill="#4E312A" />
        <circle cx="15" cy="-16" r="4.2" fill="#4E312A" />
        <circle cx="-16.3" cy="-17.5" r="1.4" fill="#FFFFFF" />
        <circle cx="13.7" cy="-17.5" r="1.4" fill="#FFFFFF" />
        {/* Nose & smile */}
        <ellipse cx="0" cy="-7" rx="5.5" ry="3.8" fill="#684650" />
        <path
          d="M -6 -1 Q 0 5 6 -1"
          fill="none"
          stroke="#684650"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Bear party hat */}
        <g transform="translate(0, -49) rotate(-6)">
          <polygon
            points="-18,0 18,0 0,-36"
            fill="#EFA9B8"
            stroke="#C8758B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M -11 -12 L 11 -12" stroke="#FFF8E9" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -6 -23 L 6 -23" stroke="#E8DFF6" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="-38" r="6" fill="#FFF8E9" stroke="#EED8DE" strokeWidth="1" />
        </g>
      </g>

      {/* RIGHT CHARACTER: Adorable White Bunny */}
      <g transform="translate(345, 168)">
        {/* Body */}
        <ellipse cx="0" cy="39" rx="39" ry="43" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="1.8" />
        <ellipse cx="0" cy="43" rx="23" ry="26" fill="#FFF1F4" />
        {/* Feet */}
        <ellipse cx="-21" cy="76" rx="14" ry="10.5" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="1.5" />
        <ellipse cx="21" cy="76" rx="14" ry="10.5" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="1.5" />
        <ellipse cx="-21" cy="76" rx="7.5" ry="5" fill="#F8CCD7" />
        <ellipse cx="21" cy="76" rx="7.5" ry="5" fill="#F8CCD7" />
        {/* Arms */}
        <ellipse
          cx="-37"
          cy="25"
          rx="12"
          ry="19"
          transform="rotate(30 -37 25)"
          fill="#FFFFFF"
          stroke="#EED8DE"
          strokeWidth="1.5"
        />
        <ellipse
          cx="37"
          cy="22"
          rx="12"
          ry="19"
          transform="rotate(-26 37 22)"
          fill="#FFFFFF"
          stroke="#EED8DE"
          strokeWidth="1.5"
        />
        {/* Tall bunny ears */}
        <g transform="translate(-17, -64) rotate(-8)">
          <ellipse cx="0" cy="0" rx="11" ry="30" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="1.6" />
          <ellipse cx="0" cy="2" rx="5.8" ry="21" fill="#F9CDD8" />
        </g>
        <g transform="translate(17, -64) rotate(8)">
          <ellipse cx="0" cy="0" rx="11" ry="30" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="1.6" />
          <ellipse cx="0" cy="2" rx="5.8" ry="21" fill="#F9CDD8" />
        </g>
        {/* Bunny head */}
        <ellipse cx="0" cy="-14" rx="42" ry="36" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="1.8" />
        {/* Rosy cheeks */}
        <ellipse cx="-23" cy="-4" rx="7.5" ry="4.5" fill="#F5A9BC" opacity="0.5" />
        <ellipse cx="23" cy="-4" rx="7.5" ry="4.5" fill="#F5A9BC" opacity="0.5" />
        {/* Eyes */}
        <circle cx="-14" cy="-15" r="4.1" fill="#4E312A" />
        <circle cx="14" cy="-15" r="4.1" fill="#4E312A" />
        <circle cx="-15.3" cy="-16.5" r="1.4" fill="#FFFFFF" />
        <circle cx="12.7" cy="-16.5" r="1.4" fill="#FFFFFF" />
        {/* Little pink nose & smile */}
        <ellipse cx="0" cy="-7" rx="4.2" ry="3" fill="#EFA9B8" />
        <path
          d="M -5.5 -2 Q 0 4 5.5 -2"
          fill="none"
          stroke="#684650"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Bunny party hat */}
        <g transform="translate(0, -47) rotate(6)">
          <polygon
            points="-16,0 16,0 0,-34"
            fill="#E8DFF6"
            stroke="#B4A1D6"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="-4" cy="-11" r="2.2" fill="#FFFFFF" />
          <circle cx="5" cy="-15" r="2.2" fill="#EFA9B8" />
          <circle cx="-1" cy="-22" r="2" fill="#FFF8E9" />
          <circle cx="0" cy="-36" r="5.5" fill="#FFF8E9" stroke="#EED8DE" strokeWidth="1" />
        </g>
      </g>

      {/* CENTER: Shared Birthday Cake with "HAPPY BIRTHDAY" */}
      <g transform="translate(230, 212)">
        {/* Pedestal plate */}
        <ellipse cx="0" cy="40" rx="64" ry="12" fill="#FFFFFF" stroke="#EED8DE" strokeWidth="2" />
        <rect x="-12" y="38" width="24" height="10" rx="4" fill="#F9E8EC" />
        {/* Cake sponge body */}
        <rect
          x="-52"
          y="-10"
          width="104"
          height="50"
          rx="14"
          fill="#F9D5DE"
          stroke="#EFA9B8"
          strokeWidth="1.8"
        />
        {/* Cream ribbon band with HAPPY BIRTHDAY text */}
        <rect x="-50" y="9" width="100" height="20" rx="6" fill="#FFF8E9" />
        <text
          x="0"
          y="22.5"
          textAnchor="middle"
          fill="#914B61"
          fontSize="9.2"
          fontWeight="800"
          letterSpacing="0.8"
          fontFamily="Nunito, sans-serif"
        >
          HAPPY BIRTHDAY
        </text>
        {/* Frosting cap & drips */}
        <path
          d="M -53 -6 Q -53 -16 0 -16 Q 53 -16 53 -6 L 53 3 Q 43 12 34 3 Q 24 14 14 2 Q 0 15 -14 2 Q -25 14 -35 3 Q -44 12 -53 3 Z"
          fill="url(#cakeFrosting)"
          stroke="#EED8DE"
          strokeWidth="1.4"
        />
        {/* Strawberries & sprinkles */}
        <circle cx="-26" cy="-13" r="5.5" fill="#E6697F" />
        <circle cx="26" cy="-13" r="5.5" fill="#E6697F" />
        <circle cx="-12" cy="-7" r="2" fill="#E8DFF6" />
        <circle cx="14" cy="-8" r="2" fill="#9ED6B5" />
        <circle cx="0" cy="-11" r="2" fill="#F9D976" />
        {/* Candle */}
        <rect x="-4" y="-40" width="8" height="25" rx="3" fill="#FFF8E9" stroke="#EFA9B8" strokeWidth="1.3" />
        <path d="M -4 -33 L 4 -29 M -4 -26 L 4 -22" stroke="#EFA9B8" strokeWidth="2.2" />
        {/* Flame */}
        <path
          d="M 0 -57 C 6 -50 6 -42 0 -41 C -6 -42 -6 -50 0 -57 Z"
          fill="#FFCA58"
        />
        <ellipse cx="0" cy="-45" rx="2.3" ry="4" fill="#FFF8D2" />
      </g>

      {/* Extra miniature gift boxes in final reveal variant */}
      {variant === 'final' && (
        <>
          <g transform="translate(48, 224) rotate(-8)">
            <rect x="-15" y="-14" width="30" height="26" rx="5" fill="#E8DFF6" stroke="#C3B0E4" strokeWidth="1.4" />
            <rect x="-3" y="-14" width="6" height="26" fill="#C8758B" />
            <rect x="-17" y="-19" width="34" height="8" rx="3" fill="#EFE8FA" stroke="#C3B0E4" strokeWidth="1.4" />
          </g>
          <g transform="translate(412, 224) rotate(8)">
            <rect x="-15" y="-14" width="30" height="26" rx="5" fill="#E4F0E5" stroke="#A7CCB0" strokeWidth="1.4" />
            <rect x="-3" y="-14" width="6" height="26" fill="#EFA9B8" />
            <rect x="-17" y="-19" width="34" height="8" rx="3" fill="#EEF7EF" stroke="#A7CCB0" strokeWidth="1.4" />
          </g>
        </>
      )}
    </svg>
  );
};
