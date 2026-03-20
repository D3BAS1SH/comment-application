'use client';

import React, { FC } from 'react';

import { TerminalNav } from '@/components/ui/terminal-nav';
import { TerminalFooter } from '@/components/ui/terminal-footer';
import { Scanline } from '@/components/ui/scanline';

/**
 * Terminal UI Layout for authentication pages.
 * Replaces the glassmorphism layout with a pitch-black terminal theme.
 * Includes the application wide navbar and footer for consistency.
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="terminal-theme flex min-h-screen flex-col bg-black text-slate-100 font-mono selection:bg-green-900 selection:text-green-400">
      <Scanline />

      {/* Shared Global Navigation */}
      <TerminalNav />

      {/* Main content container */}
      <main className="flex-grow flex items-center justify-center p-4">
        {children}
      </main>

      {/* Shared Global Footer */}
      <TerminalFooter />

      {/* Background Decoration (Grid/Radial) */}
      <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(rgba(236, 91, 19, 0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    </div>
  );
};

export default AuthLayout;
