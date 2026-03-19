'use client';

import React from 'react';
import { TerminalSpinner } from './terminal-spinner';
import { TerminalStatusLog, LogEntry } from './terminal-status-log';
import { VerifyLayout } from './verify-layout';

interface VerifyLoadingProps {
  message?: string;
}

export function VerifyLoading({
  message = 'System is processing inbound encrypted credentials.',
}: VerifyLoadingProps) {
  const entries: LogEntry[] = [
    { status: 'INFO', message: 'EXTRACTING_TOKEN_FROM_URI...' },
    { status: 'DONE', message: 'INITIALIZING_SECURE_HANDSHAKE...' },
    { status: 'PENDING', message: 'VERIFYING_WITH_BACKEND_API...' },
  ];

  return (
    <VerifyLayout>
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Status Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-green-500 font-bold text-lg animate-pulse">
            <TerminalSpinner />
            <span className="tracking-widest">VERIFYING_IDENTITY...</span>
          </div>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider px-4">
            {message}
          </p>
        </div>

        {/* Terminal Log Area */}
        <TerminalStatusLog entries={entries} />

        {/* Action Button (Disabled) */}
        <div className="w-full">
          <button
            disabled
            className="w-full bg-gray-900 text-gray-600 border border-gray-800 font-bold py-4 rounded-none tracking-widest text-xs flex items-center justify-center gap-2 cursor-wait uppercase"
          >
            <TerminalSpinner />
            PLEASE_WAIT
          </button>
        </div>

        {/* Sync Status */}
        <div className="flex justify-between w-full px-1 text-[9px] text-gray-700 uppercase">
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
            Syncing with Node
          </span>
          <span className="text-red-900/60 font-bold">
            Secure Protocol v4.2.1
          </span>
        </div>
      </div>
    </VerifyLayout>
  );
}
