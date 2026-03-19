'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';

// Components
import { TerminalWindow } from '@/components/ui/terminal-window';
import { TerminalFormInput } from '@/features/auth/components/terminal-form-input';
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

  const [pid] = useState(() => Math.floor(Math.random() * 9000) + 1000);

  return (
    <div className="w-full max-w-2xl px-4">
      <TerminalWindow
        title="USER REGISTRATION UTILITY"
        className="relative overflow-hidden"
        bodyClassName="p-6 md:p-8 space-y-8"
      >
        {/* Command Header */}
        <div className="mb-8 border-b border-gray-800 pb-4">
          <h2 className="text-green-400 text-xl font-bold mb-1 font-mono">
            <span className="text-gray-500">$</span> CREATE_NEW_USER --verbose
          </h2>
          <div className="h-0.5 w-16 bg-[#ec5b13]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <ProfileImageUpload
            imagePreview={imagePreview}
            onFileSelect={handleFileSelect}
            onClear={clearImage}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TerminalFormInput
              id="firstName"
              label="Enter First Name:"
              placeholder="operator_one"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              variant="boxed"
            />
            <TerminalFormInput
              id="lastName"
              label="Enter Last Name:"
              placeholder="prime"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              variant="boxed"
            />
          </div>

          <TerminalFormInput
            id="email"
            label="Enter Binary Address (Email):"
            type="email"
            placeholder="operator@horizon.sh"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="boxed"
          />

          <TerminalFormInput
            id="password"
            label="Initialize Access Key (Password):"
            type="password"
            placeholder="****************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="boxed"
          />

          {/* Submit Button */}
          <div className="pt-4">
            <button
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 px-6 rounded-none transition-colors flex items-center justify-center gap-2 group uppercase tracking-widest disabled:opacity-50"
              type="submit"
            >
              <span className="w-2 h-2 bg-black rounded-full group-hover:animate-pulse"></span>
              {isLoading ? 'INITIALIZING_USER...' : 'INITIALIZE_USER'}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <Link
            href="/login"
            className="text-gray-500 hover:text-green-400 text-xs transition-colors font-mono"
          >
            Already have an account? {'//'}{' '}
            <span className="underline underline-offset-4 decoration-[#ec5b13]/50">
              run login.sh
            </span>
          </Link>
        </div>

        {/* Decoder Metadata */}
        <div className="absolute bottom-2 right-4 text-[9px] text-gray-700 select-none font-mono tracking-tighter">
          LOC: 127.0.0.1 {'//'} PID: {pid} {'//'} ENV: PROD
        </div>
      </TerminalWindow>

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
