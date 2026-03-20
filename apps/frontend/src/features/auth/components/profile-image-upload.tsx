'use client';

import React from 'react';
import Image from 'next/image';
import { UploadCloud, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileImageUploadProps {
  imagePreview: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  disabled?: boolean;
}

/**
 * Profile image upload for terminal theme.
 * Square, zero radius, terminal colors.
 */
export function ProfileImageUpload({
  imagePreview,
  onFileSelect,
  onClear,
  disabled = false,
}: ProfileImageUploadProps) {
  return (
    <div className="flex flex-col items-center space-y-4 py-4 font-mono">
      <label htmlFor="image-upload" className="cursor-pointer group relative">
        <div className="w-32 h-32 border-2 border-dashed border-gray-700 flex items-center justify-center hover:border-green-400 transition-all duration-300 bg-gray-900 group-hover:bg-gray-800 relative overflow-hidden">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Profile preview"
              fill
              className="object-cover opacity-80"
            />
          ) : (
            <div className="flex flex-col items-center p-4 text-center">
              <UploadCloud
                className="text-gray-600 group-hover:text-green-400 transition-colors"
                size={32}
              />
              <span className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.2em]">
                Attach_Avatar
              </span>
            </div>
          )}

          {/* Scanline effect on image */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent h-2 w-full animate-scanline pointer-events-none" />

          <div className="absolute inset-0 bg-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/60 px-2 py-1">
              Replace_Source
            </span>
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
            className="flex items-center gap-2 text-[10px] text-red-500 hover:text-red-400 transition-colors uppercase font-bold tracking-widest"
          >
            <X size={12} />
            Unlink_Binary
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
