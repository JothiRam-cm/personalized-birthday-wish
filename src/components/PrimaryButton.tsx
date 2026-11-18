import React from 'react';

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  accentColor?: string;
  deepAccentColor?: string;
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  variant = 'primary',
  accentColor = '#C8758B',
  deepAccentColor = '#914B61',
  className = '',
  children,
  style,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-rounded font-bold text-sm sm:text-base px-7 py-3 min-h-[44px] whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';

  if (variant === 'primary') {
    return (
      <button
        type="button"
        className={`${base} text-white shadow-btn-rose ${className}`}
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${deepAccentColor} 100%)`,
          outlineColor: deepAccentColor,
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        type="button"
        className={`${base} bg-white text-[#684650] border border-[#EED8DE] shadow-sm hover:bg-[#FFF1F4] ${className}`}
        style={{ outlineColor: accentColor, ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${base} bg-transparent text-[#914B61] hover:bg-[#FFF1F4] px-5 py-2.5 ${className}`}
      style={{ outlineColor: accentColor, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};
