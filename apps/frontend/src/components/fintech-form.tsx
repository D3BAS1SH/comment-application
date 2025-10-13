'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { FintechCard } from './fintech-card';

interface FintechFormProps extends Omit<HTMLMotionProps<'form'>, 'ref'> {
  title?: string;
  subtitle?: string;
  variant?: 'card' | 'minimal' | 'glass';
  children: React.ReactNode;
}

const FintechForm = forwardRef<HTMLFormElement, FintechFormProps>(
  (
    { className, title, subtitle, variant = 'card', children, ...props },
    ref
  ) => {
    const formContent = (
      <>
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold tracking-tighter text-white mb-2"
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        <motion.form
          ref={ref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn('space-y-6', className)}
          {...props}
        >
          {children}
        </motion.form>
      </>
    );

    if (variant === 'card') {
      return (
        <FintechCard variant="glass" className="max-w-md mx-auto p-8">
          {formContent}
        </FintechCard>
      );
    }

    if (variant === 'glass') {
      return (
        <div className="max-w-md mx-auto p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          {formContent}
        </div>
      );
    }

    return <div className="max-w-md mx-auto">{formContent}</div>;
  }
);

FintechForm.displayName = 'FintechForm';

// Form field wrapper component
const FintechFormField = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ children, className }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className={cn('space-y-2', className)}
  >
    {children}
  </motion.div>
));
FintechFormField.displayName = 'FintechFormField';

export { FintechForm, FintechFormField };
