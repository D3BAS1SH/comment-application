'use client';

import type React from 'react';
import { cn } from '@/lib/utils';

interface TerminalWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Terminal window frame with traffic-light dots and title bar.
 * Wraps content in a slate-950 box with gray-700 border.
 */
export function TerminalWindow({
  title = 'BASH - 80x24',
  children,
  className,
}: TerminalWindowProps) {
  return (
    <div
      className={cn(
        'w-full bg-slate-950 border border-gray-700 shadow-[0_0_20px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      {/* Title Bar */}
      <div className="bg-gray-800 px-4 py-1 flex justify-between items-center border-b border-gray-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-600" />
          <div className="w-3 h-3 bg-yellow-600" />
          <div className="w-3 h-3 bg-green-600" />
        </div>
        <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
          {title}
        </div>
        <div className="w-12" />
      </div>

      {/* Body */}
      <div className="p-8 md:p-16 space-y-6">{children}</div>
    </div>
  );
}
