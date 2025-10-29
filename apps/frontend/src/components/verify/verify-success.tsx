'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { FintechButton } from '@/components/fintech-button';
import { VerifyLayout } from './verify-layout';

interface VerifySuccessProps {
  title?: string;
  description?: string;
  onContinue?: () => void;
}

export function VerifySuccess({
  title = 'Account Verified',
  description = "Thanks — we've verified your email. You may now sign in.",
  onContinue,
}: VerifySuccessProps) {
  return (
    <VerifyLayout>
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Animated Check Mark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <CheckCircle2
              size={64}
              className="text-green-400"
              strokeWidth={1.5}
            />
          </motion.div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400">{description}</p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full"
        >
          <FintechButton
            variant="primary"
            className="w-full"
            onClick={onContinue}
          >
            Go to Login
          </FintechButton>
        </motion.div>

        {/* Accessibility: Live region for screen readers */}
        <div
          role="status"
          aria-live="polite"
          aria-label="Email verified successfully"
          className="sr-only"
        >
          {title}. {description}
        </div>
      </div>
    </VerifyLayout>
  );
}
