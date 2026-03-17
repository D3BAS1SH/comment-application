'use client';

import React, { FC, useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Components
import { FintechForm, FintechFormField } from '@/components/fintech-form';
import { FintechInput } from '@/components/fintech-input';
import { LoadingButton } from '@/components/loading-button';
import TextType from '@/components/TextType';

// Hooks
import { useUser } from '@/lib/redux/hooks/user.hooks';
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
    <div className="grid h-full w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-lg md:grid-cols-2">
      {/* Left Column: Branding and Welcome Message */}
      <div className="hidden flex-col justify-center bg-gradient-to-br from-gray-900 to-black p-8 text-white md:flex">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold leading-tight">
            <TextType
              text="Connect with your world, instantly"
              cursorCharacter="●"
              typingSpeed={75}
              pauseDuration={1500}
              deletingSpeed={40}
              cursorBlinkDuration={0.5}
              loop
            />
          </h1>
          <p className="mt-4 text-gray-400">
            Sign in to access your dashboard and manage all your communications
            in one place
          </p>
        </motion.div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex flex-col justify-center p-8 md:p-12">
        <FintechForm
          variant="minimal"
          title="Welcome Back"
          subtitle="Enter your credentials to continue."
          onSubmit={handleSubmit}
          className="max-w-none p-0"
        >
          <FintechFormField>
            <FintechInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FintechFormField>

          <FintechFormField>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white invisible">
                  Password
                </span>
                <Link
                  href="#"
                  className="relative z-20 text-xs text-cyan-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <FintechInput
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </FintechFormField>

          <LoadingButton
            type="submit"
            className="w-full"
            isLoading={loading}
            loadingText="Authenticating..."
          >
            Login
          </LoadingButton>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-cyan-400 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </FintechForm>
      </div>
    </div>
  );
};

export default LoginPage;
