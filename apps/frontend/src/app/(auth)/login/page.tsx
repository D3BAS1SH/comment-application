'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Components
import { TerminalWindow } from '@/components/ui/terminal-window';
import { TerminalFormInput } from '@/features/auth/components/terminal-form-input';

// Hooks
import { useUser } from '@/features/auth/hooks/use-auth';
import { useNotify } from '@/hooks/use-notify';
import { loginUser } from '@/lib/redux/features/userSlice';

const LoginPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const notify = useNotify();
  const { login, loading } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const resultAction = await login({ email, password });

      if (loginUser.fulfilled.match(resultAction)) {
        notify.success('Welcome back! Login successful.');
        router.push('/home');
      } else if (loginUser.rejected.match(resultAction)) {
        const errorMsg = resultAction.payload as string;
        notify.error(
          errorMsg || 'Authentication failed. Please check your credentials.'
        );
      }
    } catch {
      notify.error('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <TerminalWindow
        title="SECURE_LOGIN_SERVER"
        className="border-green-800"
        bodyClassName="p-6 md:p-8 space-y-8"
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          {/* Username (Email in this case) */}
          <TerminalFormInput
            id="email"
            label="username@host:~$"
            placeholder="root@horizon.sh"
            type="email"
            variant="prompt"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            showCursor={true}
          />

          {/* Password */}
          <TerminalFormInput
            id="password"
            label="password:"
            type="password"
            variant="prompt"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            showCursor={true}
          />

          {/* Action Button */}
          <div className="pt-4">
            <button
              disabled={loading}
              className="w-full bg-green-600 text-black font-bold py-3 hover:bg-green-500 transition-colors uppercase tracking-widest rounded-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
              type="submit"
            >
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <Link
              href="/register"
              className="text-xs text-gray-500 hover:text-green-400 transition-colors uppercase"
            >
              No account? {'//'} run register.sh
            </Link>
          </div>
        </form>

        {/* Status Footer */}
        <div className="flex justify-between items-center text-[10px] text-green-900 border-t border-green-900/30 pt-4 mt-4">
          <span>STATUS: ENCRYPTED_CHANNEL</span>
          <span>v2.4.0-STABLE</span>
        </div>
      </TerminalWindow>
    </div>
  );
};

export default LoginPage;
