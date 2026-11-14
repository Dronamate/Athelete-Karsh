import React from 'react';

export default function BrandLogo({ size = 'md', inverted = false, className = '' }) {
  // Size tier mapping with crystal-clear, strictly single-line proportions
  const sizeMap = {
    sm: {
      img: 'h-8 sm:h-9',
      title: 'text-lg sm:text-xl',
      subtitle: 'text-[9px] tracking-[0.16em]',
      gap: 'gap-2',
    },
    md: {
      img: 'h-10 sm:h-12',
      title: 'text-2xl sm:text-[26px]',
      subtitle: 'text-[9px] sm:text-[10px] tracking-[0.2em]',
      gap: 'gap-2.5',
    },
    lg: {
      img: 'h-12 sm:h-14',
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-[10px] sm:text-[11px] tracking-[0.22em]',
      gap: 'gap-3',
    },
    xl: {
      img: 'h-16 sm:h-20',
      title: 'text-4xl sm:text-5xl',
      subtitle: 'text-xs sm:text-sm tracking-[0.25em]',
      gap: 'gap-4',
    },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center ${current.gap} select-none shrink-0 whitespace-nowrap ${className}`}>
      {/* Aerodynamic Emblem - tightly cropped, transparent, high-visibility */}
      <img
        src="/logo.png"
        alt="DronaMate Emblem"
        className={`${current.img} w-auto object-contain shrink-0 filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105`}
        onError={(e) => {
          // If PNG fails, fallback to favicon.svg
          if (e.target.src !== '/favicon.svg') {
            e.target.src = '/favicon.svg';
          }
        }}
      />
      <div className="flex flex-col justify-center min-w-0 shrink-0 whitespace-nowrap">
        <div className={`flex items-center font-display font-black ${current.title} tracking-tight leading-none whitespace-nowrap`}>
          <span className={inverted ? 'text-white' : 'text-[#0c2340]'}>DRONA</span>
          <span className="text-[#ff5500]">MATE</span>
        </div>
        <span
          className={`font-sans font-extrabold uppercase ${current.subtitle} mt-0.5 whitespace-nowrap ${
            inverted ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Your Training Partner
        </span>
      </div>
    </div>
  );
}

