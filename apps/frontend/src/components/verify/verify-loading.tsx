'use client';

import { motion } from 'framer-motion';
import { Spinner } from '@/components/spinner';
import { VerifyLayout } from './verify-layout';

interface VerifyLoadingProps {
  message?: string;
}

export function VerifyLoading({
  message = 'Verifying your account…',
}: VerifyLoadingProps) {
  return (
    <VerifyLayout>
      <div className="flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <Spinner size="lg" variant="ring" />
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Verifying Email</h2>
          <p className="text-gray-400">{message}</p>
        </div>

        {/* Accessibility: Live region for screen readers */}
        <div
          role="status"
          aria-live="polite"
          aria-label="Verifying your email"
          className="sr-only"
        >
          {message}
        </div>
      </div>
    </VerifyLayout>
  );
}
