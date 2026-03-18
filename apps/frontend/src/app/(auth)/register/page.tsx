'use client';

import React, { FC, useState } from 'react';
import Image from 'next/image';
import { Mail, Lock, User, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import {
  FintechForm,
  FintechFormField,
} from '@/features/auth/components/auth-form';
import { FintechInput } from '@/features/auth/components/auth-input';
import { LoadingButton } from '@/features/auth/components/loading-button';
import TextType from '@/features/auth/components/text-type';
import { ImageCropperModal } from '@/features/auth/components/image-cropper-modal';

// Hooks
import { useImageUpload } from '@/features/auth/hooks/use-image-upload';
import { useUser } from '@/features/auth/hooks/use-auth';
import { useNotify } from '@/hooks/use-notify';
import apiClient from '@/lib/api/api-client';
import { registerUser } from '@/lib/redux/features/userSlice';

// Types
import { UploadUrlResponse } from '@/features/auth/types/user.interface';

const RegisterPage: FC = () => {
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const notify = useNotify();
  const { register, loading: isRegistering } = useUser();
  const {
    imagePreview,
    originalImage,
    setImage,
    clearImage,
    handleFileChange,
    imageFile,
  } = useImageUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
    if (e.target.files?.[0]) {
      setIsCropperOpen(true);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setImage(croppedImage);
    setIsCropperOpen(false);
  };

  const handleCropperClose = () => {
    setIsCropperOpen(false);
    const fileInput = document.getElementById(
      'image-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getSignedUploadUrl = async (): Promise<UploadUrlResponse> => {
    try {
      const response =
        await apiClient.get<UploadUrlResponse>('/auth/upload-url');
      return response.data;
    } catch {
      throw new Error('Could not prepare image upload. Please try again.');
    }
  };

  const handleImageUpload = async (): Promise<string> => {
    if (!imageFile) throw new Error('No image context found.');

    setIsUploading(true);
    try {
      const signatureData = await getSignedUploadUrl();
      const formData = new FormData();
      formData.append('api_key', signatureData.api_key);
      formData.append('file', imageFile);
      formData.append('signature', signatureData.signature);
      formData.append('timestamp', signatureData.timestamp.toString());
      if (signatureData.upload_preset) {
        formData.append('upload_preset', signatureData.upload_preset);
      }

      const uploadResponse = await fetch(signatureData.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Cloudinary upload failed');

      const data = await uploadResponse.json();
      return data.secure_url;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      notify.error('Please fill in all required fields.');
      return;
    }

    try {
      let finalImageUrl: string | undefined = undefined;

      if (imagePreview) {
        try {
          finalImageUrl = await handleImageUpload();
        } catch {
          notify.error('Profile image upload failed. Registration halted.');
          return;
        }
      }

      const resultAction = await register({
        email,
        firstName,
        lastName,
        password,
        imageUrl: finalImageUrl,
      });

      if (registerUser.fulfilled.match(resultAction)) {
        notify.success('Account created! Please check your email to verify.');
        router.push('/login');
      } else if (registerUser.rejected.match(resultAction)) {
        const errorMsg = resultAction.payload as string;
        notify.error(errorMsg || 'Registration failed. Please try again.');
      }
    } catch {
      notify.error('An unexpected error occurred.');
    }
  };

  const isLoading = isRegistering || isUploading;

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
          {/* Image Upload Block */}
          <div className="flex flex-col items-center space-y-3 py-2">
            <label
              htmlFor="image-upload"
              className="cursor-pointer group relative"
            >
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center hover:border-cyan-400/50 transition-all duration-300 bg-white/5 group-hover:bg-white/10 relative overflow-hidden shadow-inner">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile preview"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud
                      className="text-gray-500 group-hover:text-cyan-400 transition-colors"
                      size={28}
                    />
                    <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                      Attach
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <UploadCloud className="text-white" size={20} />
                </div>
              </div>
            </label>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isLoading}
            />

            <AnimatePresence>
              {imagePreview && (
                <motion.button
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  type="button"
                  onClick={clearImage}
                  className="text-xs text-red-400/80 hover:text-red-400 transition-colors"
                >
                  Remove photo
                </motion.button>
              )}
            </AnimatePresence>
          </div>

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
            loadingText={
              isUploading ? 'Uploading Image...' : 'Creating Account...'
            }
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
