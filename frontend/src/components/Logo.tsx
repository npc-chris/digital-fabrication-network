import React from 'react';

export interface LogoProps {
  priority?: boolean;
  className?: string;
  variant?: 'responsive' | 'mark' | 'compact' | 'wide' | 'full';
  width?: number;
  height?: number;
  animated?: boolean;
}

export default function Logo({
  priority = false,
  className = '',
  variant = 'responsive',
  width,
  height,
  animated = true,
}: LogoProps) {
  const baseImgClasses = `w-auto object-contain transition-all duration-300 ease-out ${
    animated ? 'group-hover:scale-[1.03] group-hover:brightness-105' : ''
  }`;

  if (variant === 'responsive') {
    return (
      <picture className={`inline-flex items-center group relative cursor-pointer ${className}`}>
        {/* Large screens (> 1024px): Full 800x200 wide logo */}
        <source media="(min-width: 1024px)" srcSet="/DFN - 800x200.svg" />
        {/* Medium screens (640px - 1023px): 700x200 wide logo */}
        <source media="(min-width: 640px)" srcSet="/DFN - 700x200.svg" />
        {/* Small screens (< 640px): 400x200 compact logo */}
        <source media="(max-width: 639px)" srcSet="/DFN - 400x200.svg" />
        <img
          src="/DFN - 800x200.svg"
          alt="Digital Fabrication Network"
          width={width || 192}
          height={height || 48}
          className={`h-8 sm:h-9 md:h-10 ${baseImgClasses}`}
          loading={priority ? 'eager' : 'lazy'}
          {...(priority ? { fetchPriority: 'high' } : {})}
        />
      </picture>
    );
  }

  const srcMap: Record<NonNullable<LogoProps['variant']>, string> = {
    mark: '/DFN - 200x200.svg',
    compact: '/DFN - 400x200.svg',
    wide: '/DFN - 700x200.svg',
    full: '/DFN - 800x200.svg',
    responsive: '/DFN - 800x200.svg',
  };

  const currentSrc = srcMap[variant] || '/DFN - 800x200.svg';

  return (
    <div className={`inline-flex items-center group relative cursor-pointer ${className}`}>
      <img
        src={currentSrc}
        alt="Digital Fabrication Network"
        width={width || (variant === 'mark' ? 40 : 192)}
        height={height || (variant === 'mark' ? 40 : 48)}
        className={`${variant === 'mark' ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-8 sm:h-9'} ${baseImgClasses}`}
        loading={priority ? 'eager' : 'lazy'}
        {...(priority ? { fetchPriority: 'high' } : {})}
      />
    </div>
  );
}

