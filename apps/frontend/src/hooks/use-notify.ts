'use client';

import { toast } from 'sonner';

/**
 * Custom hook for standardized notifications across the application.
 * Ensures consistent styling and behavior for success, error, and loading states.
 */
export const useNotify = () => {
  const notify = {
    success: (message: string, description?: string) => {
      toast.success(message, { description });
    },
    error: (message: string, description?: string) => {
      toast.error(message, { description });
    },
    info: (message: string, description?: string) => {
      toast.info(message, { description });
    },
    warning: (message: string, description?: string) => {
      toast.warning(message, { description });
    },
    loading: (message: string) => {
      return toast.loading(message);
    },
    dismiss: (toastId?: string | number) => {
      toast.dismiss(toastId);
    },
    // Useful for async operations
    promise: <T>(
      promise: Promise<T>,
      {
        loading = 'Processing...',
        success = 'Completed successfully',
        error = 'An error occurred',
      }: { loading?: string; success?: string; error?: string }
    ) => {
      return toast.promise(promise, {
        loading,
        success,
        error: (err: unknown) => {
          if (typeof err === 'string') return err;
          if (err instanceof Error) return err.message;
          if (err && typeof err === 'object' && 'message' in err) {
            return (err as { message: string }).message;
          }
          return error;
        },
      });
    },
  };

  return notify;
};
