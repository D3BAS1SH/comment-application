'use client';

import { useEffect, useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { VerifyLoading } from '@/components/verify/verify-loading';
import { VerifySuccess } from '@/components/verify/verify-success';
import { VerifyError } from '@/components/verify/verify-error';
import authClient from '@/lib/http/axios.auth';

type VerifyState = 'loading' | 'success' | 'error';

interface VerifyErrorData {
  title: string;
  message: string;
  errorCode?: string;
}

// Backend error shape returned by the auth-service
interface BackendError {
  statusCode?: number;
  message?: string;
  error?: string;
  detail?: string;
  errorCode?: string;
  code?: string;
}

export default function VerifyUserPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get('token');

  // Initialize state based on presence of token to avoid setState in Effect
  const [state, setState] = useState<VerifyState>(
    tokenParam ? 'loading' : 'error'
  );
  const [error, setError] = useState<VerifyErrorData | null>(
    tokenParam
      ? null
      : {
          title: 'Verification Failed',
          message: 'Verification token missing or invalid.',
          errorCode: 'MISSING_TOKEN',
        }
  );
  const [token] = useState<string | null>(tokenParam);
  const [retryCount, setRetryCount] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  // Verify email with token
  const verifyEmail = useCallback(async (verifyToken: string) => {
    // Use AbortController with axios via the `signal` option
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await authClient.get(`/api/v1/auth/users/verify-email`, {
        params: { token: verifyToken },
        signal: controller.signal,
      });

      console.log(response);

      clearTimeout(timeoutId);

      // Axios returns a status number and data payload
      if (response.status >= 200 && response.status < 300) {
        setState('success');
        // reset retry state on success
        setRetryCount(0);
        setExhausted(false);
        console.log('[v0] Email verification successful');
        return;
      }

      // Non-2xx responses will generally be thrown by axios, but handle defensively
      const data = response.data || {};
      const errorMessage = data.message || data.error || data.detail;

      let userMessage =
        "We couldn't verify your account. The verification link may be expired or invalid.";
      const errorCode =
        data.error || data.code || data.errorCode || 'UNKNOWN_ERROR';

      if (errorCode === 'EXPIRED_TOKEN') {
        userMessage =
          'This verification link has expired. Please request a new one.';
      } else if (errorCode === 'ALREADY_VERIFIED') {
        userMessage =
          'Your account has already been verified. You can now sign in.';
      } else if (errorCode === 'INVALID_TOKEN') {
        userMessage =
          'Invalid verification link. Please check your email and try again.';
      } else if (errorMessage) {
        userMessage = errorMessage;
      }

      // Ensure error object is set before changing state so the UI can render immediately
      setError({
        title: 'Verification Failed',
        message: userMessage,
        errorCode,
      });
      setState('error');
      console.log('[v0] Verification failed:', {
        status: response.status,
        errorCode,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      // Handle axios-style errors and AbortError
      const axiosErr = err as AxiosError<BackendError>;

      // Aborted by timeout/abort controller
      if (
        axiosErr?.code === 'ERR_CANCELED' ||
        axiosErr?.name === 'CanceledError' ||
        axiosErr?.message?.toLowerCase?.().includes('aborted')
      ) {
        // Set error first so render has the payload when state flips to 'error'
        setError({
          title: 'Request Timeout',
          message: 'The verification request took too long. Please try again.',
          errorCode: 'TIMEOUT',
        });
        setState('error');
        console.log('[v0] Verification aborted/timeout:', axiosErr?.message);
        return;
      }

      // Axios HTTP error with response
      if (axiosErr?.response) {
        const { status, data = {} } = axiosErr.response as {
          status: number;
          data: BackendError;
        };
        const errorMessage = data.message || data.error || data.detail;
        let userMessage =
          "We couldn't verify your account. The verification link may be expired or invalid.";
        // include `errorCode` response key used by the backend (e.g. "NOTFOUND")
        let errorCode =
          data.error || data.code || data.errorCode || 'UNKNOWN_ERROR';

        // Map by HTTP status first (explicit service error types)
        if (status === 400) {
          errorCode = errorCode || 'BAD_REQUEST';
          userMessage =
            errorMessage || 'Verification token missing or invalid.';
        } else if (status === 401) {
          // Token expired or unauthorized
          errorCode = errorCode || 'EXPIRED_TOKEN';
          userMessage =
            errorMessage ||
            'This verification link has expired. Please request a new one.';
        } else if (status === 404) {
          // Backend may return NOTFOUND when token was deleted after successful verification
          errorCode = errorCode || 'NOT_FOUND';
          userMessage =
            errorMessage ||
            'Verification token not found or invalid. It may have already been used.';
        } else if (status >= 500) {
          errorCode = errorCode || 'SERVER_ERROR';
          userMessage =
            errorMessage || 'Server error occurred. Please try again later.';
        } else {
          // Fallback to service-provided codes that TokenService throws
          if (errorCode === 'EXPIRED_TOKEN') {
            userMessage =
              'This verification link has expired. Please request a new one.';
          } else if (errorCode === 'ALREADY_VERIFIED') {
            userMessage =
              'Your account has already been verified. You can now sign in.';
          } else if (errorCode === 'INVALID_TOKEN') {
            userMessage =
              'Invalid verification link. Please check your email and try again.';
          } else if (errorCode === 'NOTFOUND' || errorCode === 'NOT_FOUND') {
            userMessage =
              'Verification token not found or invalid. It may have already been used.';
          } else if (errorMessage) {
            userMessage = errorMessage;
          }
        }

        // Ensure error object is present before toggling state
        setError({
          title: 'Verification Failed',
          message: userMessage,
          errorCode,
        });
        setState('error');
        console.log('[v0] Verification HTTP error:', { status, errorCode });
        return;
      }

      // Network or unknown error
      setError({
        title: 'Network Error',
        message:
          'Unable to connect. Please check your connection and try again.',
        errorCode: 'NETWORK_ERROR',
      });
      setState('error');
      console.log('[v0] Verification error:', err);
    }
  }, []);

  // Auto-verify when token is available
  useEffect(() => {
    if (token && state === 'loading') {
      // Use setTimeout to avoid synchronous setState in effect (React 19 / Next 16 linting)
      const timer = setTimeout(() => {
        verifyEmail(token);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token, state, verifyEmail]);

  const handleRetry = () => {
    if (!token) return;

    // If we've already exhausted attempts, prompt the user to check their email
    if (exhausted || retryCount >= 4) {
      // mark exhausted and show helpful message guiding user to their inbox
      setRetryCount((prev) => prev + 1);
      setExhausted(true);
      setError({
        title: 'Verification Attempts Exhausted',
        message:
          "We've tried verifying automatically 5 times. Please open your email inbox and click the verification link directly. If you can't find it, check your spam folder or request a new verification link from the app.",
        errorCode: 'RETRY_EXHAUSTED',
      });
      setState('error');
      // Optionally, also focus the contact support action
      return;
    }

    // Otherwise perform another verification attempt
    setRetryCount((prev) => prev + 1);
    setState('loading');
    setError(null);
    verifyEmail(token);
  };

  const handleContinue = () => {
    router.push('/login');
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support form or redirect to support
    window.location.href = 'mailto:support@horizoncomms.com';
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
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
    </div>
  );
}
