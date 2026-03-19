'use client';

import { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VerifyLoading } from '@/features/auth/components/verify/verify-loading';
import { VerifySuccess } from '@/features/auth/components/verify/verify-success';
import { VerifyError } from '@/features/auth/components/verify/verify-error';
import apiClient from '@/lib/api/api-client';
import { useNotify } from '@/hooks/use-notify';

type VerifyState = 'loading' | 'success' | 'error';

interface VerifyErrorData {
  title: string;
  message: string;
  errorCode?: string;
}

function VerifyUserContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const notify = useNotify();

  const token = searchParams.get('token');

  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'error');
  const [error, setError] = useState<VerifyErrorData | null>(
    token
      ? null
      : {
          title: 'Verification Failed',
          message: 'Verification token missing or invalid.',
          errorCode: 'MISSING_TOKEN',
        }
  );

  const hasStarted = useRef(false);

  const verifyEmail = useCallback(
    async (verifyToken: string) => {
      try {
        // Standardized call to BFF
        const response = await apiClient.get('/auth/verify-email-token', {
          params: { token: verifyToken },
        });

        if (response.status === 200) {
          setState('success');
          notify.success('Email verified successfully!');
        }
      } catch (err: unknown) {
        const errorData = err as { errorCode?: string; message?: string };
        const errorCode = errorData.errorCode || 'UNKNOWN_ERROR';
        let userMessage =
          "We couldn't verify your account. The link may be expired or invalid.";

        if (errorCode === 'EXPIRED_TOKEN') {
          userMessage =
            'This verification link has expired. Please request a new one.';
        } else if (errorCode === 'ALREADY_VERIFIED') {
          userMessage =
            'Your account has already been verified. You can now sign in.';
        } else if (errorCode === 'INVALID_TOKEN' || errorCode === 'NOT_FOUND') {
          userMessage =
            'Invalid or used verification link. Please check your email and try again.';
        }

        setError({
          title: 'Verification Failed',
          message: userMessage,
          errorCode,
        });
        setState('error');
      }
    },
    [notify]
  );

  useEffect(() => {
    // Initial verification: Run once on mount if token exists
    if (token && !hasStarted.current) {
      hasStarted.current = true;
      // We intentionally call this inside useEffect for one-time initialization.

      verifyEmail(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRetry = async () => {
    if (!token) return;
    setError(null);
    setState('loading');
    await verifyEmail(token);
  };

  const handleContinue = () => router.push('/login');
  const handleBackHome = () => router.push('/');
  const handleContactSupport = () => {
    window.location.href = 'mailto:support@horizoncomms.com';
  };

  return (
    <>
      {state === 'loading' && <VerifyLoading />}
      {state === 'success' && <VerifySuccess onContinue={handleContinue} />}
      {state === 'error' && error && (
        <VerifyError
          title={error.title}
          message={error.message}
          errorCode={error.errorCode}
          onRetry={handleRetry}
          onContactSupport={handleContactSupport}
          onBack={handleBackHome}
        />
      )}
    </>
  );
}

export default function VerifyUserPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyUserContent />
    </Suspense>
  );
}
