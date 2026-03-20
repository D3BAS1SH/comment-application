'use client';

import { Scanline } from '@/components/ui/scanline';
import { TerminalNav } from '@/components/ui/terminal-nav';
import { TerminalFooter } from '@/components/ui/terminal-footer';

/**
 * Shared layout for marketing pages (Landing, About).
 * Provides the terminal theme container, scanline effect, nav, and footer.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="terminal-theme min-h-screen bg-black text-gray-400 selection:bg-green-900 selection:text-white font-mono">
      <Scanline />
      <TerminalNav />
      {children}
      <TerminalFooter />
    </div>
  );
}
