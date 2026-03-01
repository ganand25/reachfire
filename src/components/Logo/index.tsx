'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps): React.JSX.Element {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-base' },
    md: { container: 'w-10 h-10', text: 'text-lg' },
    lg: { container: 'w-12 h-12', text: 'text-xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo SVG Mark */}
      <svg
        viewBox="0 0 40 40"
        className={cn(sizes[size].container, 'flex-shrink-0')}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="reachfire-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.62 0.26 35)" />
            <stop offset="50%" stopColor="oklch(0.70 0.24 50)" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 75)" />
          </linearGradient>
        </defs>

        {/* Outer circle */}
        <circle cx="20" cy="20" r="19" stroke="url(#reachfire-gradient)" strokeWidth="1.5" opacity="0.3" />

        {/* Flame shape - upward pointing fire */}
        <path
          d="M 20 6 C 20 6 15 12 15 17 C 15 22 17.2 25 20 25 C 22.8 25 25 22 25 17 C 25 12 20 6 20 6 Z"
          fill="url(#reachfire-gradient)"
        />

        {/* Inner flame highlight */}
        <path
          d="M 20 10 C 20 10 17 14 17 17 C 17 20 18.3 22 20 22 C 21.7 22 23 20 23 17 C 23 14 20 10 20 10 Z"
          fill="oklch(0.85 0.18 75)"
          opacity="0.6"
        />

        {/* Upward arrow/growth indicator */}
        <path
          d="M 20 28 L 20 34 M 17 31 L 20 28 L 23 31"
          stroke="url(#reachfire-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Reach indicator - small circles */}
        <circle cx="14" cy="20" r="1.5" fill="url(#reachfire-gradient)" opacity="0.7" />
        <circle cx="26" cy="20" r="1.5" fill="url(#reachfire-gradient)" opacity="0.7" />
      </svg>

      {/* Text Mark */}
      {showText && (
        <span className={cn('font-display font-bold gradient-ember-text', sizes[size].text)}>
          ReachFire
        </span>
      )}
    </div>
  );
}

/**
 * Logo Symbol Only - for use in favicons or compact spaces
 */
export function LogoSymbol({ className, size = 'md' }: Omit<LogoProps, 'showText'>): React.JSX.Element {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <svg
      viewBox="0 0 40 40"
      className={cn(sizes[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="reachfire-gradient-symbol" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.62 0.26 35)" />
          <stop offset="50%" stopColor="oklch(0.70 0.24 50)" />
          <stop offset="100%" stopColor="oklch(0.78 0.18 75)" />
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="20" cy="20" r="19" stroke="url(#reachfire-gradient-symbol)" strokeWidth="1.5" opacity="0.3" />

      {/* Flame shape */}
      <path
        d="M 20 6 C 20 6 15 12 15 17 C 15 22 17.2 25 20 25 C 22.8 25 25 22 25 17 C 25 12 20 6 20 6 Z"
        fill="url(#reachfire-gradient-symbol)"
      />

      {/* Inner flame highlight */}
      <path
        d="M 20 10 C 20 10 17 14 17 17 C 17 20 18.3 22 20 22 C 21.7 22 23 20 23 17 C 23 14 20 10 20 10 Z"
        fill="oklch(0.85 0.18 75)"
        opacity="0.6"
      />

      {/* Upward arrow */}
      <path
        d="M 20 28 L 20 34 M 17 31 L 20 28 L 23 31"
        stroke="url(#reachfire-gradient-symbol)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Reach indicators */}
      <circle cx="14" cy="20" r="1.5" fill="url(#reachfire-gradient-symbol)" opacity="0.7" />
      <circle cx="26" cy="20" r="1.5" fill="url(#reachfire-gradient-symbol)" opacity="0.7" />
    </svg>
  );
}
