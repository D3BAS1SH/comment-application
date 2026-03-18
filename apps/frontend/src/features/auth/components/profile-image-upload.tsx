'use client';

import React from 'react';
import Image from 'next/image';
import { UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileImageUploadProps {
  imagePreview: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  disabled?: boolean;
}

/**
 * Profile image upload circle with preview, hover overlay, and remove button.
 * Purely presentational — all logic is handled by the parent via props.
 */
export function ProfileImageUpload({
  imagePreview,
  onFileSelect,
  onClear,
  disabled = false,
}: ProfileImageUploadProps) {
  return (
    <div className="flex flex-col items-center space-y-3 py-2">
      <label htmlFor="image-upload" className="cursor-pointer group relative">
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
        onChange={onFileSelect}
        disabled={disabled}
      />

      <AnimatePresence>
        {imagePreview && (
          <motion.button
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            type="button"
            onClick={onClear}
            className="text-xs text-red-400/80 hover:text-red-400 transition-colors"
          >
            Remove photo
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
