'use client';

import React, { FC, useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { FormInput } from '@/components/form-input';
import TextType from '@/components/TextType';
import { useError, useUser } from '@/lib/redux/hooks/user.hooks';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Main Login Page Component
const LoginPage: FC = () => {
  const [emailState, setEmailState] = useState<string>('');
  const [passwordState, setPasswordState] = useState<string>('');
  const router = useRouter();
  const { login } = useUser();
  const errorMessage = useError();

  // Strongly type the form event
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    // Handle login logic here
    try {
      const thunkResponse = await login({
        email: emailState,
        password: passwordState,
      });
      console.log(thunkResponse);
      if (thunkResponse.meta.requestStatus === 'rejected') {
        throw new Error(
          errorMessage ?? (thunkResponse.payload as string) ?? ''
        );
      }
      toast.success('Login Successful');
      router.push('/home');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error('Login failed due to some unknown reason');
      console.error(error);
      return;
    }
    console.log(`email: ${emailState}, password: ${passwordState}`);
    console.log('Login form submitted');
  };

  return (
    <div className="grid h-full w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-lg md:grid-cols-2">
      {/* Left Column: Branding and Welcome Message */}
      <div className="hidden flex-col justify-center bg-gradient-to-br from-gray-900 to-black p-8 text-white md:flex">
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            <TextType
              text={'Connect with your world, instantly'}
              cursorCharacter="●"
              typingSpeed={75}
              pauseDuration={20}
              deletingSpeed={40}
              cursorBlinkDuration={0.5}
              loop
            />
          </h1>
          <p className="mt-4 text-gray-400">
            Sign in to access your dashboard and manage all your communications
            in one place
          </p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex flex-col justify-center p-8 md:p-12">
        <h2 className="mb-2 text-3xl font-bold text-white">Welcome Back</h2>
        <p className="mb-8 text-gray-400">
          Enter your credentials to continue.
        </p>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="flex flex-col space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email Address
            </label>
            <FormInput
              id="email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={20} />}
              onChange={(e) => setEmailState(e.target.value)}
              value={emailState}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <Link href="#" className="text-sm text-cyan-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <FormInput
              id="password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={20} />}
              onChange={(e) => setPasswordState(e.target.value)}
              value={passwordState}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-center font-bold text-black shadow-lg transition-transform duration-200 hover:scale-105 hover:from-cyan-500 hover:to-violet-600 focus:outline-none focus:ring-4 focus:ring-cyan-400/50"
          >
            Login
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href={'/register'}
            className="font-medium text-cyan-400 hover:underline"
          >
            {' '}
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
