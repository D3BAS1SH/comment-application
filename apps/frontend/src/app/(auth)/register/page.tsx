'use client';

import type React from 'react';
import { type FC, useState } from 'react';
import { Mail, Lock, User, UploadCloud } from 'lucide-react';
import { FormInput } from '@/components/form-input';
import Link from 'next/link';
import TextType from '@/components/TextType';
import { ImageCropperModal } from '@/components/image-cropper-modal';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useError, useUser } from '@/lib/redux/hooks/user.hooks';
import { toast } from 'sonner';
import { UploadUrlResponse } from '@/types/user.interface';
import authClient from '@/lib/http/axios.auth';

// Main Register Page Component
const RegisterPage: FC = () => {
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { register } = useUser();
  const errorResponse = useError();
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
    // Clear the file input to allow selecting the same file again
    const fileInput = document.getElementById(
      'image-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getSignedUploadUrl = async (): Promise<UploadUrlResponse> => {
    try {
      console.log('Requesting signed upload URL...');
      const response = await authClient.get('/api/v1/auth/upload-url');

      if (!response.data) {
        throw new Error('No data received from upload URL endpoint');
      }

      console.log('Signed URL received successfully');
      return response.data as UploadUrlResponse;
    } catch (error) {
      console.error('Failed to get signed upload URL:', error);

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Network Error')) {
          throw new Error(
            'Network error: Please check your internet connection'
          );
        }
        if (error.message.includes('401')) {
          throw new Error('Authentication failed: Please log in again');
        }
        if (error.message.includes('500')) {
          throw new Error('Server error: Please try again later');
        }
        throw new Error(`Failed to get upload URL: ${error.message}`);
      }

      throw new Error('Failed to get upload URL due to unknown error');
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      // Form validation
      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim() ||
        !password.trim()
      ) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      let finalImageUrl: string | undefined = undefined;

      console.log('Form submitted with:', {
        firstName,
        lastName,
        email,
        hasImage: !!imagePreview,
      });

      // Handle image upload if present
      if (imagePreview) {
        try {
          finalImageUrl = await handleImageUpload();
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          toast.error('Failed to upload profile image. Please try again.');
          return;
        }
      }

      // Register user
      try {
        const registerResponse = await register({
          email,
          firstName,
          lastName,
          password,
          imageUrl: finalImageUrl,
        });

        if (registerResponse.meta.requestStatus === 'rejected') {
          const errorMessage =
            errorResponse || 'Registration failed. Please try again.';
          toast.error(errorMessage);
          console.error('Registration failed:', errorMessage);
        } else {
          toast.success(
            'Account created successfully! Please check your email to verify your account.'
          );
          console.log('Registration successful');
          // Optionally clear form or redirect
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          clearImage();
        }
      } catch (registrationError) {
        console.error('Registration error:', registrationError);
        toast.error(
          'Registration failed due to a server error. Please try again.'
        );
      }
    } catch (error) {
      console.error('Unexpected error during form submission:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  // Separate function for image upload logic
  const handleImageUpload = async (): Promise<string> => {
    if (!imageFile) {
      throw new Error('No image file available for upload');
    }

    try {
      // Get signed upload URL
      const signatureData = await getSignedUploadUrl();

      if (!signatureData) {
        throw new Error('Failed to get upload signature');
      }

      console.log('Uploading image to Cloudinary...');

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append('api_key', signatureData.api_key);
      formData.append('file', imageFile);
      formData.append('signature', signatureData.signature);
      formData.append('timestamp', signatureData.timestamp.toString());

      if (signatureData.upload_preset) {
        formData.append('upload_preset', signatureData.upload_preset);
      }

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(signatureData.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!cloudinaryResponse.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await cloudinaryResponse.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // If we can't parse error response, use status text
          errorMessage = cloudinaryResponse.statusText || errorMessage;
        }
        throw new Error(`Cloudinary upload failed: ${errorMessage}`);
      }

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryData.secure_url) {
        throw new Error('Upload succeeded but no secure URL received');
      }

      console.log('Image uploaded successfully:', cloudinaryData.secure_url);
      return cloudinaryData.secure_url;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }
      throw new Error('Image upload failed due to unknown error');
    }
  };

  return (
    <div className="grid h-full w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-lg md:grid-cols-2">
      {/* Left Column: Branding and Welcome Message */}
      <div className="hidden flex-col justify-center bg-gradient-to-br from-gray-900 to-black p-8 text-white md:flex">
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            <TextType
              text={'Join the Horizon Community'}
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
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex flex-col justify-center p-8 md:p-12">
        <h2 className="mb-2 text-3xl font-bold text-white">Create Account</h2>
        <p className="mb-8 text-gray-400">
          Fill in the details below to get started.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Image Upload */}
          <div className="flex flex-col items-center space-y-3">
            <label htmlFor="image-upload" className="cursor-pointer group">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-cyan-400 transition-all duration-300 bg-white/5 group-hover:bg-white/10 relative overflow-hidden">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview || '/placeholder.svg'}
                      alt="Profile preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <UploadCloud className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud
                      className="text-gray-500 group-hover:text-cyan-400 transition-colors"
                      size={32}
                    />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                  </div>
                )}
              </div>
            </label>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <div className="text-center">
              <p className="text-xs text-gray-400">
                Click to upload and crop your profile picture
              </p>
              <p className="text-xs text-gray-500">
                Maximum 10MB • JPG, PNG, GIF
              </p>
            </div>
            {imagePreview && (
              <button
                type="button"
                onClick={clearImage}
                className="text-xs text-red-400 hover:text-red-300 transition-colors underline"
              >
                Remove image
              </button>
            )}
          </div>

          {/* First and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="firstname"
              type="text"
              placeholder="First Name"
              icon={<User size={20} />}
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
            <FormInput
              id="lastname"
              type="text"
              placeholder="Last Name"
              icon={<User size={20} />}
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
          </div>

          {/* Email */}
          <FormInput
            id="email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={20} />}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          {/* Password */}
          <FormInput
            id="password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={20} />}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-center font-bold text-black shadow-lg transition-transform duration-200 hover:scale-105 hover:from-cyan-500 hover:to-violet-600 focus:outline-none focus:ring-4 focus:ring-cyan-400/50"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-cyan-400 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* Image Cropper Modal */}
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
