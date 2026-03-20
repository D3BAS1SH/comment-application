'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { TerminalWindow } from '@/components/ui/terminal-window';

interface VerifyLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

/**
 * Redesigned VerifyLayout using the red security terminal theme.
 */
export function VerifyLayout({
  children,
  className,
  title = 'AUTOMATED_IDENTITY_VERIFICATION',
}: VerifyLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <TerminalWindow
        title={title}
        className="max-w-md mx-auto border-red-900/40 shadow-[0_0_40px_rgba(153,27,27,0.1)]"
        headerClassName="bg-red-950/20 border-red-900/30 font-mono"
        titleClassName="text-red-500 font-bold tracking-widest"
        bodyClassName="p-8 space-y-8"
      >
        {children}

        {/* Decorative Corner Elements */}
        <div className="absolute top-0 left-0 border-t border-l border-red-900/30 w-8 h-8 pointer-events-none" />
        <div className="absolute bottom-0 right-0 border-b border-r border-red-900/30 w-8 h-8 pointer-events-none" />
      </TerminalWindow>
    </motion.div>
  );
}
