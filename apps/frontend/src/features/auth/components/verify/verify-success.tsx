'use client';

import React from 'react';
import { TerminalStatusLog, LogEntry } from './terminal-status-log';
import { VerifyLayout } from './verify-layout';
import { CheckCircle2 } from 'lucide-react';

interface VerifySuccessProps {
  title?: string;
  description?: string;
  onContinue?: () => void;
}

export function VerifySuccess({
  title = 'IDENTITY_VERIFIED',
  description = 'Access granted. Secured handshake complete.',
  onContinue,
}: VerifySuccessProps) {
  const entries: LogEntry[] = [
    { status: 'DONE', message: 'TOKEN_VALIDATION_COMPLETE' },
    { status: 'DONE', message: 'USER_ACCOUNT_ACTIVATED' },
    { status: 'SUCCESS', message: 'PERMISSION_HANDOFF_AUTHORIZED' },
  ];

  return (
    <VerifyLayout title="VERIFICATION_SUCCESSFUL">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Success Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
            <CheckCircle2 size={48} className="text-green-500 relative z-10" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-green-500 tracking-widest uppercase">
              {title}
            </h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">
              {description}
            </p>
          </div>
        </div>

        <TerminalStatusLog entries={entries} showPrompt={false} />

        <div className="w-full">
          <button
            onClick={onContinue}
            className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 rounded-none tracking-widest text-xs flex items-center justify-center gap-2 uppercase transition-colors"
          >
            GO_TO_DASHBOARD
          </button>
        </div>

        <div className="flex justify-between w-full px-1 text-[9px] text-gray-700 uppercase">
          <span>Trace: Completed</span>
          <span className="text-green-900/60 font-bold">Node: HC-PRIME-01</span>
        </div>
      </div>
    </VerifyLayout>
  );
}
