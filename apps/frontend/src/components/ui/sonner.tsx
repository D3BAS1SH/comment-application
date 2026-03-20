'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border-gray-800 group-[.toaster]:shadow-[0_0_20px_rgba(0,0,0,0.5)] group-[.toaster]:rounded-none group-[.toaster]:font-mono group-[.toaster]:uppercase group-[.toaster]:tracking-widest group-[.toaster]:text-[10px]',
          description: 'group-[.toast]:text-gray-500 font-mono text-[9px]',
          actionButton:
            'group-[.toast]:bg-green-600 group-[.toast]:text-black font-bold uppercase tracking-widest rounded-none',
          cancelButton:
            'group-[.toast]:bg-gray-800 group-[.toast]:text-gray-400 font-bold uppercase tracking-widest rounded-none',
          success: 'group-[.toast]:text-green-500',
          error: 'group-[.toast]:text-red-500',
          info: 'group-[.toast]:text-cyan-400',
          warning: 'group-[.toast]:text-yellow-400',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
