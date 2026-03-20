'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api/api-client';
import { UploadUrlResponse } from '@/features/auth/types/user.interface';

interface UseCloudinaryUploadReturn {
  isUploading: boolean;
  uploadImage: (imageFile: File) => Promise<string>;
}

/**
 * Hook to handle Cloudinary image upload via signed URL.
 * Gets a signed upload URL from the BFF, then uploads directly to Cloudinary.
 */
export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState(false);

  const getSignedUploadUrl =
    useCallback(async (): Promise<UploadUrlResponse> => {
      try {
        const response =
          await apiClient.get<UploadUrlResponse>('/auth/upload-url');
        return response.data;
      } catch {
        throw new Error('Could not prepare image upload. Please try again.');
      }
    }, []);

  const uploadImage = useCallback(
    async (imageFile: File): Promise<string> => {
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
    },
    [getSignedUploadUrl]
  );

  return { isUploading, uploadImage };
}
