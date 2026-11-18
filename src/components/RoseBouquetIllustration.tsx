import React from 'react';

export const RoseBouquetIllustration: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const RoseFlower = ({
    cx,
    cy,
    scale = 1,
    rot = 0,
  }: {
    cx: number;
    cy: number;
    scale?: number;
    rot?: number;
  }) => (
    <g transform={`translate(${cx}, ${cy}) scale(${scale}) rotate(${rot})`}>
      {/* Outer petals */}
      <circle cx="0" cy="0" r="22" fill="#C93B54" />
      <ellipse cx="-11" cy="-6" rx="14" ry="12" fill="#D84A63" />
      <ellipse cx="11" cy="-5" rx="14" ry="12" fill="#DF566F" />
      <ellipse cx="0" cy="10" rx="15" ry="11" fill="#BF334B" />
      {/* Inner spiral petals */}
      <circle cx="0" cy="-1" r="12.5" fill="#E8657D" />
      <path
        d="M -7 -3 C -5 -10 7 -10 8 -2 C 9 5 -2 8 -6 3 C -8 0 -4 -5 2 -4 C 4 -3 3 2 0 1"
        fill="none"
        stroke="#9A2037"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {/* Soft petal highlight */}
      <path
        d="M -11 -11 Q -4 -16 5 -13"
        fill="none"
        stroke="#FBC3CE"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>
  );

  return (
    <svg
      viewBox="0 0 340 380"
      className={`w-full max-w-[310px] h-auto mx-auto select-none ${className}`}
      role="img"
      aria-label="A bouquet of red roses wrapped in cream paper with a dusty red ribbon"
    >
      <defs>
        <radialGradient id="bouquetShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#914B61" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#914B61" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="creamWrapFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor="#F8EBDD" />
        </linearGradient>
        <linearGradient id="creamWrapBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF6EA" />
          <stop offset="100%" stopColor="#EED9C4" />
        </linearGradient>
      </defs>

      {/* Contact shadow underneath */}
      <ellipse cx="170" cy="354" rx="88" ry="14" fill="url(#bouquetShadow)" />

      {/* Back wrapping paper */}
      <path
        d="M 65 130 Q 170 65 275 130 L 204 286 Q 170 302 136 286 Z"
        fill="url(#creamWrapBack)"
        stroke="#E4CCB4"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Green leaves */}
      <g fill="#73AA82" stroke="#578966" strokeWidth="1.5">
        <ellipse cx="96" cy="136" rx="28" ry="13" transform="rotate(-35 96 136)" />
        <ellipse cx="244" cy="134" rx="28" ry="13" transform="rotate(35 244 134)" />
        <ellipse cx="132" cy="86" rx="26" ry="12" transform="rotate(-65 132 86)" />
        <ellipse cx="208" cy="86" rx="26" ry="12" transform="rotate(65 208 86)" />
        <ellipse cx="170" cy="70" rx="14" ry="28" fill="#82B990" />
      </g>

      {/* Baby's breath tiny cream dots */}
      <g fill="#FFFFFF" stroke="#EED8DE" strokeWidth="0.8">
        <circle cx="92" cy="112" r="4" />
        <circle cx="102" cy="102" r="3.5" />
        <circle cx="246" cy="108" r="4" />
        <circle cx="235" cy="96" r="3.2" />
        <circle cx="148" cy="74" r="3.8" />
        <circle cx="195" cy="74" r="3.8" />
      </g>

      {/* Clustered Red Roses */}
      <RoseFlower cx={136} cy={104} scale={0.92} rot={-10} />
      <RoseFlower cx={204} cy={104} scale={0.92} rot={12} />
      <RoseFlower cx={170} cy={92} scale={1.04} rot={0} />
      <RoseFlower cx={112} cy={138} scale={0.96} rot={-16} />
      <RoseFlower cx={228} cy={138} scale={0.96} rot={16} />
      <RoseFlower cx={150} cy={140} scale={1.06} rot={-6} />
      <RoseFlower cx={192} cy={142} scale={1.05} rot={8} />
      <RoseFlower cx={170} cy={170} scale={1.0} rot={3} />

      {/* Front folded cream wrapping cone */}
      <path
        d="M 78 160 Q 124 198 170 218 Q 216 198 262 160 L 200 326 Q 170 342 140 326 Z"
        fill="url(#creamWrapFront)"
        stroke="#E4CCB4"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Subtle fold line */}
      <path
        d="M 170 218 L 166 334"
        stroke="#E8D4BE"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Stems peeking slightly below */}
      <path
        d="M 152 328 L 146 348 M 166 332 L 165 352 M 180 332 L 182 350 M 192 328 L 198 346"
        stroke="#5E8F6B"
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* Prominent Dusty-Red Ribbon & Bow */}
      <g transform="translate(170, 268)">
        {/* Ribbon wrap band */}
        <path
          d="M -36 -7 Q 0 3 36 -7 L 33 10 Q 0 19 -33 10 Z"
          fill="#B64962"
          stroke="#913248"
          strokeWidth="1.5"
        />
        {/* Flowing ribbon tails */}
        <path
          d="M -6 8 C -20 34 -34 52 -42 74 L -26 68 L -18 78 C -12 52 -4 30 0 10 Z"
          fill="#C85A73"
          stroke="#913248"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M 6 8 C 20 34 34 52 42 74 L 26 68 L 18 78 C 12 52 4 30 0 10 Z"
          fill="#C85A73"
          stroke="#913248"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Bow loops */}
        <path
          d="M -4 0 C -34 -28 -56 -4 -44 14 C -34 26 -14 14 -4 3 Z"
          fill="#D4667E"
          stroke="#913248"
          strokeWidth="1.5"
        />
        <path
          d="M 4 0 C 34 -28 56 -4 44 14 C 34 26 14 14 4 3 Z"
          fill="#D4667E"
          stroke="#913248"
          strokeWidth="1.5"
        />
        {/* Center knot */}
        <rect
          x="-9"
          y="-8"
          width="18"
          height="18"
          rx="6"
          fill="#B64962"
          stroke="#913248"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
};
