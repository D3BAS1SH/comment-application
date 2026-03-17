'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import { FintechCard } from '@/components/fintech-card';

interface VerifyLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function VerifyLayout({ children, className }: VerifyLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      id="Something Called Layout"
    >
      <FintechCard
        variant="glass"
        className="max-w-md mx-auto p-8"
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {children}
      </FintechCard>
    </motion.div>
  );
}
