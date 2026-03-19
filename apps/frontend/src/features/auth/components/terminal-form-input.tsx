'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BlinkingCursor } from './blinking-cursor';

interface TerminalFormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  variant?: 'boxed' | 'prompt';
  promptSymbol?: string;
  showCursor?: boolean;
}

/**
 * A terminal-themed input component.
 * 'boxed' variant: Label above, input inside a box.
 * 'prompt' variant: Label as a prompt (username@host:~$), bottom border only.
 */
export const TerminalFormInput: React.FC<TerminalFormInputProps> = ({
  label,
  variant = 'boxed',
  promptSymbol = '>',
  showCursor = false,
  className,
  id,
  value,
  placeholder,
  ...props
}) => {
  const isPassword = props.type === 'password';
  const displayValue = isPassword
    ? '•'.repeat((value as string)?.length || 0)
    : value || '';

  if (variant === 'prompt') {
    return (
      <div className="space-y-1 group">
        <label
          className="block text-slate-400 text-xs font-mono uppercase tracking-widest opacity-80"
          htmlFor={id}
        >
          <span className="text-green-500 mr-2">$</span>
          {label}
        </label>
        <div className="relative flex items-center font-mono">
          <div className="absolute inset-0 flex items-center pointer-events-none whitespace-pre select-none">
            <span className="text-green-400">{displayValue}</span>
            {showCursor && <BlinkingCursor className="w-[0.5em] h-[1em]" />}
          </div>
          <input
            id={id}
            value={value}
            className={cn(
              'w-full bg-transparent border-t-0 border-x-0 border-b border-gray-800 focus:ring-0 focus:border-green-500 text-transparent caret-transparent p-0 py-1 transition-colors rounded-none outline-none font-mono selection:bg-green-500/30 selection:text-green-400',
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        className="block text-slate-400 text-xs font-mono uppercase tracking-widest"
        htmlFor={id}
      >
        <span className="text-green-500 mr-2">{promptSymbol}</span>
        {label}
      </label>
      <div className="relative flex items-center font-mono bg-gray-900 border border-gray-800 focus-within:border-green-500/50 transition-all">
        <div className="absolute inset-0 flex items-center px-4 pointer-events-none whitespace-pre select-none overflow-hidden">
          <span className="text-slate-100">{displayValue}</span>
          {!displayValue && placeholder && (
            <span className="text-gray-700">{placeholder}</span>
          )}
          {showCursor && <BlinkingCursor className="w-[0.5em] h-[1.1em]" />}
        </div>
        <input
          id={id}
          value={value}
          className={cn(
            'w-full bg-transparent border-none text-transparent caret-transparent px-4 py-3 rounded-none focus:ring-0 outline-none transition-all font-mono selection:bg-green-500/30 selection:text-white',
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
};
