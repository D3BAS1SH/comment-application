'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FintechInputProps extends Omit<HTMLMotionProps<'input'>, 'ref'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'floating' | 'minimal';
}

const FintechInput = forwardRef<HTMLInputElement, FintechInputProps>(
  (
    { className, label, error, icon, variant = 'default', type, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const baseInputClasses =
      'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50';

    const variants = {
      default: baseInputClasses,
      floating:
        'w-full bg-transparent border-b-2 border-white/10 px-0 py-3 text-white placeholder-transparent backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 rounded-none',
      minimal:
        'w-full bg-transparent border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-cyan-400/50',
    };

    return (
      <div className="relative">
        {variant === 'floating' && label && (
          <motion.label
            initial={false}
            animate={{
              y: isFocused || hasValue ? -24 : 0,
              scale: isFocused || hasValue ? 0.85 : 1,
              color: isFocused ? '#22d3ee' : '#9ca3af',
            }}
            className="absolute left-0 top-3 origin-left text-gray-400 transition-all duration-200 pointer-events-none"
          >
            {label}
          </motion.label>
        )}

        {variant !== 'floating' && label && (
          <label className="block text-sm font-medium text-white mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <motion.input
            ref={ref}
            type={inputType}
            className={cn(
              variants[variant],
              icon && 'pl-10',
              isPassword && 'pr-10',
              error &&
                'border-red-500 focus:border-red-500 focus:ring-red-500/50',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              setHasValue(e.target.value !== '');
            }}
            onChange={(e) => {
              setHasValue(e.target.value !== '');
              props.onChange?.(e);
            }}
            whileFocus={{ scale: 1.01 }}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

FintechInput.displayName = 'FintechInput';

export { FintechInput };
