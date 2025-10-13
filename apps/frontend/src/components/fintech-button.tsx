'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface FintechButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const FintechButton = forwardRef<HTMLButtonElement, FintechButtonProps>(
  (
    { className, variant = 'primary', size = 'md', children, ...props },
    ref
  ) => {
    const baseClasses =
      'relative inline-flex items-center justify-center font-bold tracking-tighter transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:from-cyan-500 hover:to-violet-600 hover:shadow-lg hover:shadow-cyan-500/25',
      secondary:
        'bg-white/5 text-white border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-400/50',
      outline:
        'border border-white/10 text-white hover:bg-white/10 hover:border-cyan-400/50 backdrop-blur-sm',
      ghost: 'text-white hover:bg-white/5 hover:text-cyan-400',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {variant === 'primary' && (
          <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-cyan-400/20 to-violet-500/20 blur-xl" />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }
);

FintechButton.displayName = 'FintechButton';

export { FintechButton };
