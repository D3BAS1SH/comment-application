'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

type CardVariant = 'default' | 'gradient' | 'glass' | 'hover-glow';

interface FintechCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: CardVariant;
  children: React.ReactNode;
}

const FintechCard = forwardRef<HTMLDivElement, FintechCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const cardVariant: CardVariant = variant;

    const baseClasses = 'rounded-2xl border transition-all duration-300';

    const variants: Record<CardVariant, string> = {
      default: 'border-white/10 bg-white/5 backdrop-blur-sm',
      gradient:
        'border-white/10 bg-gradient-to-br from-cyan-950/30 to-violet-950/30 backdrop-blur-sm',
      glass: 'border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl',
      'hover-glow':
        'border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 group',
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        whileHover={{ y: -2 }}
        className={cn(baseClasses, variants[cardVariant], className)}
        {...props}
      >
        {cardVariant === 'hover-glow' && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-violet-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

FintechCard.displayName = 'FintechCard';

const FintechCardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pb-4', className)} {...props} />
));
FintechCardHeader.displayName = 'FintechCardHeader';

const FintechCardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
FintechCardContent.displayName = 'FintechCardContent';

const FintechCardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-bold tracking-tighter text-white', className)}
    {...props}
  />
));
FintechCardTitle.displayName = 'FintechCardTitle';

const FintechCardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-gray-400', className)} {...props} />
));
FintechCardDescription.displayName = 'FintechCardDescription';

export {
  FintechCard,
  FintechCardHeader,
  FintechCardContent,
  FintechCardTitle,
  FintechCardDescription,
};
