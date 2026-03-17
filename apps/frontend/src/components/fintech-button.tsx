'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Spinner } from './spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface FintechButtonProps extends Omit<
  HTMLMotionProps<'button'>,
  'ref' | 'size'
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  spinnerVariant?: 'ring' | 'dots' | 'gradient';
}

const FintechButton = forwardRef<HTMLButtonElement, FintechButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      loadingText,
      spinnerVariant = 'ring',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonVariant: ButtonVariant = variant;
    const buttonSize: ButtonSize = size;

    const baseClasses =
      'relative inline-flex items-center justify-center font-bold tracking-tighter transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:from-cyan-500 hover:to-violet-600 hover:shadow-lg hover:shadow-cyan-500/25',
      secondary:
        'bg-white/5 text-white border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-400/50',
      outline:
        'border border-white/10 text-white hover:bg-white/10 hover:border-cyan-400/50 backdrop-blur-sm',
      ghost: 'text-white hover:bg-white/5 hover:text-cyan-400',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={isLoading ? {} : { scale: 1.02 }}
        whileTap={isLoading ? {} : { scale: 0.98 }}
        className={cn(
          baseClasses,
          variants[buttonVariant],
          sizes[buttonSize],
          className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {buttonVariant === 'primary' && (
          <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-cyan-400/20 to-violet-500/20 blur-xl" />
        )}

        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-inherit/50">
            <Spinner
              variant={spinnerVariant}
              size={size === 'sm' ? 'sm' : 'md'}
            />
          </div>
        )}

        <span
          className={cn(
            'relative z-10 flex items-center gap-2 transition-opacity duration-200',
            isLoading && 'opacity-0'
          )}
        >
          {children}
        </span>
        {isLoading && loadingText && (
          <span className="sr-only">{loadingText}</span>
        )}
      </motion.button>
    );
  }
);

FintechButton.displayName = 'FintechButton';

export { FintechButton };
