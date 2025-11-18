'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ring' | 'dots' | 'gradient';
  className?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', variant = 'ring', className }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
    };

    // Ring Spinner
    if (variant === 'ring') {
      return (
        <div ref={ref} className={cn(sizeClasses[size], className)}>
          <motion.svg
            className="w-full h-full"
            viewBox="0 0 50 50"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          >
            <motion.circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3"
              stroke="url(#spinnerGradient)"
              strokeDasharray="31.4 125.6"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient
                id="spinnerGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>
      );
    }

    // Dots Spinner
    if (variant === 'dots') {
      return (
        <div ref={ref} className={cn('flex items-center gap-1', className)}>
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn(
                dotSizes[size],
                'rounded-full bg-gradient-to-r from-cyan-400 to-violet-500'
              )}
              animate={{ scale: [0.7, 1, 0.7], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.4,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      );
    }

    // Gradient Spinner
    if (variant === 'gradient') {
      return (
        <div ref={ref} className={cn(sizeClasses[size], className)}>
          <motion.svg
            className="w-full h-full"
            viewBox="0 0 50 50"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          >
            <defs>
              <linearGradient
                id="gradientSpinner"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="2"
              stroke="url(#gradientSpinner)"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="2"
              stroke="url(#gradientSpinner)"
              opacity="0.3"
            />
          </motion.svg>
        </div>
      );
    }

    return null;
  }
);

Spinner.displayName = 'Spinner';

export { Spinner };
