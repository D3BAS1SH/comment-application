'use client';

import type React from 'react';
import { useState, useCallback } from 'react';

export function useImageUpload() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const setImage = useCallback((dataUrl: string) => {
    setImagePreview(dataUrl);
    // Convert data URL to File object for upload
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
        });
        setImageFile(file);
      })
      .catch(console.error);
  }, []);

  const setOriginalImageForCropping = useCallback((dataUrl: string) => {
    setOriginalImage(dataUrl);
  }, []);

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    setOriginalImage(null);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB for original, will be compressed after crop)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Create preview for cropping
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  return {
    imagePreview,
    imageFile,
    originalImage,
    setImage,
    setOriginalImageForCropping,
    clearImage,
    handleFileChange,
  };
}
