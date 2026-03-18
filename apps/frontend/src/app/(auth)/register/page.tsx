'use client';

import React, { FC } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Components
import {
  FintechForm,
  FintechFormField,
} from '@/features/auth/components/auth-form';
import { FintechInput } from '@/features/auth/components/auth-input';
import { LoadingButton } from '@/features/auth/components/loading-button';
import TextType from '@/features/auth/components/text-type';
import { ImageCropperModal } from '@/features/auth/components/image-cropper-modal';
import { ProfileImageUpload } from '@/features/auth/components/profile-image-upload';

// Hooks
import { useRegisterForm } from '@/features/auth/hooks/use-register-form';

const RegisterPage: FC = () => {
  const {
    firstName,
    lastName,
    email,
    password,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    imagePreview,
    originalImage,
    isCropperOpen,
    handleFileSelect,
    handleCropComplete,
    handleCropperClose,
    clearImage,
    handleSubmit,
    isLoading,
  } = useRegisterForm();

  return (
    <div className="grid h-full w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-lg md:grid-cols-2">
      {/* Left Column: Branding */}
      <div className="hidden flex-col justify-center bg-gradient-to-br from-gray-900 to-black p-8 text-white md:flex">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold leading-tight">
            <TextType
              text="Join the Horizon Community"
              cursorCharacter="●"
              typingSpeed={75}
              pauseDuration={1500}
              deletingSpeed={40}
              cursorBlinkDuration={0.5}
              loop
            />
          </h1>
          <p className="mt-4 text-gray-400">
            Create an account to start your journey and connect with a global
            network
          </p>
        </motion.div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex flex-col justify-center p-8 md:p-12 overflow-y-auto max-h-[90vh]">
        <FintechForm
          variant="minimal"
          title="Create Account"
          subtitle="Fill in the details below to get started."
          onSubmit={handleSubmit}
          className="p-0 space-y-4"
        >
          <ProfileImageUpload
            imagePreview={imagePreview}
            onFileSelect={handleFileSelect}
            onClear={clearImage}
            disabled={isLoading}
          />

          <div className="grid grid-cols-2 gap-4">
            <FintechFormField>
              <FintechInput
                label="First Name"
                placeholder="John"
                icon={<User size={16} />}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </FintechFormField>
            <FintechFormField>
              <FintechInput
                label="Last Name"
                placeholder="Doe"
                icon={<User size={16} />}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </FintechFormField>
          </div>

          <FintechFormField>
            <FintechInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FintechFormField>

          <FintechFormField>
            <FintechInput
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FintechFormField>

          <LoadingButton
            type="submit"
            className="w-full mt-4"
            isLoading={isLoading}
            loadingText="Creating Account..."
          >
            Create Account
          </LoadingButton>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-cyan-400 hover:underline"
            >
              Log in
            </Link>
          </p>
        </FintechForm>
      </div>

      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={handleCropperClose}
        onCropComplete={handleCropComplete}
        initialImage={originalImage || ''}
      />
    </div>
  );
};

export default RegisterPage;
