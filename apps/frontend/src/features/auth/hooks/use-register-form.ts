'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './use-auth';
import { useNotify } from '@/hooks/use-notify';
import { useImageUpload } from './use-image-upload';
import { useCloudinaryUpload } from './use-cloudinary-upload';
import { registerUser } from '@/lib/redux/features/userSlice';

interface UseRegisterFormReturn {
  // Form state
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;

  // Image state (delegated from useImageUpload)
  imagePreview: string | null;
  originalImage: string | null;
  isCropperOpen: boolean;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCropComplete: (croppedImage: string) => void;
  handleCropperClose: () => void;
  clearImage: () => void;

  // Submit
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook that encapsulates all register form logic:
 * form state, image handling, validation, and submission.
 */
export function useRegisterForm(): UseRegisterFormReturn {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);

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
  const { isUploading, uploadImage } = useCloudinaryUpload();

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileChange(e);
      if (e.target.files?.[0]) {
        setIsCropperOpen(true);
      }
    },
    [handleFileChange]
  );

  const handleCropComplete = useCallback(
    (croppedImage: string) => {
      setImage(croppedImage);
      setIsCropperOpen(false);
    },
    [setImage]
  );

  const handleCropperClose = useCallback(() => {
    setIsCropperOpen(false);
    const fileInput = document.getElementById(
      'image-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!firstName || !lastName || !email || !password) {
        notify.error('Please fill in all required fields.');
        return;
      }

      try {
        let finalImageUrl: string | undefined = undefined;

        if (imagePreview && imageFile) {
          try {
            finalImageUrl = await uploadImage(imageFile);
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
    },
    [
      firstName,
      lastName,
      email,
      password,
      imagePreview,
      imageFile,
      notify,
      register,
      uploadImage,
      router,
    ]
  );

  const isLoading = isRegistering || isUploading;

  return {
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
  };
}
