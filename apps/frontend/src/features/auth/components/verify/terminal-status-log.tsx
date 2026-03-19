'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LogEntry {
  message: string;
  status: 'INFO' | 'SUCCESS' | 'PENDING' | 'ERROR' | 'DONE';
  timestamp?: string;
}

interface TerminalStatusLogProps {
  entries: LogEntry[];
  showPrompt?: boolean;
}

/**
 * A terminal log area showing multiple status lines.
 */
export const TerminalStatusLog: React.FC<TerminalStatusLogProps> = ({
  entries,
  showPrompt = true,
}) => {
  return (
    <div className="w-full bg-black/50 border border-gray-900 p-4 font-mono text-[10px] leading-relaxed">
      {entries.map((entry, i) => (
        <div key={i} className="flex gap-2 mb-1">
          <span
            className={cn(
              'font-bold shrink-0',
              entry.status === 'ERROR' ? 'text-red-500' : 'text-gray-600'
            )}
          >
            [{entry.status}]
          </span>
          <span className="text-gray-400 uppercase tracking-tight">
            {entry.message}
          </span>
          <span
            className={cn(
              'ml-auto font-bold',
              entry.status === 'SUCCESS' || entry.status === 'DONE'
                ? 'text-green-500'
                : entry.status === 'PENDING'
                  ? 'text-yellow-500 animate-pulse'
                  : entry.status === 'ERROR'
                    ? 'text-red-500'
                    : 'text-gray-600'
            )}
          >
            {entry.status === 'PENDING' ? 'RUNNING' : entry.status}
          </span>
        </div>
      ))}
      {showPrompt && (
        <div className="mt-2 text-gray-700 animate-pulse">&gt; _</div>
      )}
    </div>
  );
};
