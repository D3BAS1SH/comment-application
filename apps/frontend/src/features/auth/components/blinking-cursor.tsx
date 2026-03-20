'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BlinkingCursorProps {
  className?: string;
  color?: string;
}

/**
 * A simple blinking block cursor for terminal inputs.
 */
export const BlinkingCursor: React.FC<BlinkingCursorProps> = ({
  className,
  color = 'bg-green-600',
}) => {
  return (
    <span
      className={cn(
        'inline-block w-[0.6em] h-[1em] vertical-middle ml-1 animate-pulse',
        color,
        className
      )}
      style={{ animationDuration: '0.8s' }}
    />
  );
};
