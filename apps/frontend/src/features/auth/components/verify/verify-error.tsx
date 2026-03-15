'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { FintechButton } from '@/components/fintech-button';
import { VerifyLayout } from './verify-layout';

interface VerifyErrorProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  onBack?: () => void;
}

export function VerifyError({
  title = 'Verification Failed',
  message = "We couldn't verify your account. The verification link may be expired or invalid.",
  errorCode,
  onRetry,
  onContactSupport,
  onBack,
}: VerifyErrorProps) {
  return (
    <VerifyLayout>
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Error Icon */}
        <motion.div
          id="Alerted"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AlertCircle size={64} className="text-red-400" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 text-sm">{message}</p>
          {errorCode && (
            <p className="text-gray-500 text-xs">Error code: {errorCode}</p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full space-y-3"
        >
          <FintechButton variant="primary" className="w-full" onClick={onRetry}>
            Try Again
          </FintechButton>

          <div className="flex gap-3">
            <FintechButton
              variant="outline"
              className="flex-1"
              onClick={onContactSupport}
            >
              Contact Support
            </FintechButton>
            <FintechButton variant="ghost" className="flex-1" onClick={onBack}>
              Back Home
            </FintechButton>
          </div>
        </motion.div>

        {/* Accessibility: Alert region for screen readers */}
        <div
          role="alert"
          aria-live="assertive"
          aria-label="Error verifying email"
          className="sr-only"
        >
          {title}. {message}
        </div>
      </div>
    </VerifyLayout>
  );
}
