'use client';

import * as React from 'react';
import { Button, type buttonVariants } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';

interface LoadingButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  spinnerVariant?: 'ring' | 'dots' | 'gradient';
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      isLoading,
      loadingText,
      spinnerVariant = 'ring',
      className,
      disabled,
      variant,
      size,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn('relative', className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-x-0 flex items-center justify-center">
            <Spinner
              variant={spinnerVariant}
              size={size === 'sm' ? 'sm' : 'md'}
            />
          </div>
        )}
        <span
          className={cn('flex items-center gap-2', isLoading && 'opacity-0')}
        >
          {children}
        </span>
        {isLoading && loadingText && (
          <span className="ml-2 sr-only">{loadingText}</span>
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
