'use client';

import React from 'react';
import { Terminal } from 'lucide-react';

/**
 * Global header for authentication pages with terminal theme.
 */
export const AuthTerminalHeader: React.FC = () => {
  return (
    <header className="border-b border-gray-800 bg-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Terminal className="text-[#ec5b13] w-6 h-6" />
        <h1 className="text-xl font-bold tracking-tighter text-slate-100 font-mono">
          HORIZONCOMMS<span className="text-[#ec5b13]">_OS</span>
        </h1>
      </div>
      <div className="text-[10px] text-gray-500 hidden md:block font-mono uppercase tracking-widest">
        SYS_STATUS: <span className="text-green-400">ONLINE</span> | STACK:
        AUTH_GATEWAY_V1
      </div>
    </header>
  );
};
