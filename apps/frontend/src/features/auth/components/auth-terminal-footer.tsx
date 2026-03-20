'use client';

import React from 'react';

/**
 * Global footer for authentication pages with terminal theme.
 */
export const AuthTerminalFooter: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800 p-6 text-center text-[10px] text-gray-600 font-mono">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-6 uppercase tracking-[0.2em]">
          <a className="hover:text-[#ec5b13] transition-colors" href="#">
            Documentation
          </a>
          <a className="hover:text-[#ec5b13] transition-colors" href="#">
            Security_Policy
          </a>
          <a className="hover:text-[#ec5b13] transition-colors" href="#">
            Kernel_Logs
          </a>
        </div>
        <p className="tracking-widest capitalize">
          © {new Date().getFullYear()} HORIZON COMMUNICATIONS SYSTEM - ALL
          RIGHTS RESERVED
        </p>
      </div>
    </footer>
  );
};
