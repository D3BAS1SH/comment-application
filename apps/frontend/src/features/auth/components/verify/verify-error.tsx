'use client';

import React from 'react';
import { TerminalStatusLog, LogEntry } from './terminal-status-log';
import { VerifyLayout } from './verify-layout';
import { AlertCircle } from 'lucide-react';

interface VerifyErrorProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  onBack?: () => void;
}

export function VerifyError({
  title = 'VERIFICATION_FAILED',
  message = 'Inbound token invalid or expired. Access denied.',
  errorCode = 'SEC_ERR_TOKEN_MISMATCH',
  onRetry,
  onContactSupport,
  onBack,
}: VerifyErrorProps) {
  const entries: LogEntry[] = [
    { status: 'DONE', message: 'EXTRACTING_TOKEN_FROM_URI' },
    { status: 'ERROR', message: `VALIDATION_ERROR: ${errorCode}` },
    { status: 'INFO', message: 'CONNECTION_TERMINATED_BY_HOST' },
  ];

  return (
    <VerifyLayout title="ACCESS_DENIED_ALARM">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Error Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full animate-pulse" />
            <AlertCircle
              size={56}
              className="text-red-500 relative z-10"
              strokeWidth={1.5}
            />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 tracking-widest uppercase animate-bounce">
              {title}
            </h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">
              {message}
            </p>
          </div>
        </div>

        <TerminalStatusLog entries={entries} showPrompt={false} />

        <div className="w-full space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-red-600 hover:bg-red-500 text-black font-bold py-4 rounded-none tracking-widest text-xs flex items-center justify-center gap-2 uppercase transition-colors shadow-[0_4px_20px_rgba(239,68,68,0.3)]"
          >
            RETRY_PROTOCOL
          </button>

          <div className="flex gap-3">
            <button
              onClick={onContactSupport}
              className="flex-1 bg-transparent border border-gray-800 text-gray-500 hover:text-white hover:border-white py-2 text-[10px] font-bold tracking-widest uppercase transition-all"
            >
              ADM_CONTACT
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-transparent border border-gray-800 text-gray-500 hover:text-white hover:border-white py-2 text-[10px] font-bold tracking-widest uppercase transition-all"
            >
              TERM_EXIT
            </button>
          </div>
        </div>

        <div className="flex justify-between w-full px-1 text-[9px] text-gray-700 uppercase">
          <span className="text-red-900 animate-pulse">ALARM_ACTIVE</span>
          <span className="text-red-900/60 font-bold">Node: SEC-01-FAIL</span>
        </div>
      </div>
    </VerifyLayout>
  );
}
