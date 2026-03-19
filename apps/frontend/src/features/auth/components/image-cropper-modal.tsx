'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { BlinkingCursor } from './blinking-cursor';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
  initialImage: string;
}

// Helper function to create image from URL
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Helper function to get cropped image
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    pixelCrop.width,
    pixelCrop.height,
    rotation
  );

  // Set canvas size to the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas context to center point of bounding box
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-pixelCrop.width / 2, -pixelCrop.height / 2);

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.95);
};

// Helper function to calculate rotated size
const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = (rotation * Math.PI) / 180;

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

export function ImageCropperModal({
  isOpen,
  onClose,
  onCropComplete,
  initialImage,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  const onCropCompleteHandler = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(
        initialImage,
        croppedAreaPixels,
        rotation
      );
      onCropComplete(croppedImage);
      onClose();
    } catch (e) {
      console.error('Error cropping image:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <TerminalWindow
              title="CROP_PROFILE_PICTURE --target=avatar"
              bodyClassName="p-6 space-y-6"
            >
              {/* Header Title with Blinking Cursor */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-green-400 font-bold text-lg">
                  <span className="text-gray-500 mr-2">$</span>
                  CROP_UTILITY
                  <BlinkingCursor className="ml-2" />
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Crop Area */}
              <div className="relative w-full h-80 border border-gray-800 overflow-hidden bg-black/50">
                <Cropper
                  image={initialImage}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onRotationChange={onRotationChange}
                  onCropComplete={onCropCompleteHandler}
                  showGrid={true}
                  style={{
                    containerStyle: {
                      borderRadius: '0px',
                    },
                    cropAreaStyle: {
                      border: '2px solid #22c55e', // text-green-500
                      borderRadius: '0',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                    },
                  }}
                />
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Zoom Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs tracking-widest text-gray-500 uppercase font-bold">
                    <div className="flex items-center gap-2">
                      <ZoomIn size={14} className="text-green-500" />
                      SET_ZOOM_LEVEL
                    </div>
                    <span className="text-green-400">
                      [{Math.round(zoom * 100)}%]
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                      className="text-gray-500 hover:text-green-400 transition-colors"
                      disabled={zoom <= 1}
                    >
                      <ZoomOut size={18} />
                    </button>
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) =>
                          setZoom(Number.parseFloat(e.target.value))
                        }
                        className="w-full h-1 bg-gray-800 appearance-none cursor-pointer accent-green-500"
                      />
                    </div>
                    <button
                      onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                      className="text-gray-500 hover:text-green-400 transition-colors"
                      disabled={zoom >= 3}
                    >
                      <ZoomIn size={18} />
                    </button>
                  </div>
                </div>

                {/* Rotation Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs tracking-widest text-gray-500 uppercase font-bold">
                    <div className="flex items-center gap-2">
                      <RotateCw size={14} className="text-blue-400" />
                      SET_ROTATION_ANGLE
                    </div>
                    <span className="text-blue-400">[{rotation}°]</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setRotation(rotation - 90)}
                      className="text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={rotation}
                        onChange={(e) =>
                          setRotation(Number.parseInt(e.target.value))
                        }
                        className="w-full h-1 bg-gray-800 appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => setRotation(rotation + 90)}
                      className="text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      <RotateCw size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-800/50">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 border border-gray-800 hover:border-gray-600 hover:text-gray-300 transition-all disabled:opacity-50"
                  disabled={isProcessing}
                >
                  ABORT_OPERATION
                </button>
                <button
                  onClick={handleCrop}
                  disabled={isProcessing || !croppedAreaPixels}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-black font-bold text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-black rounded-full group-hover:animate-pulse" />
                  {isProcessing ? 'PROCESSING...' : 'EXECUTE_CROP'}
                </button>
              </div>

              {/* Instructions */}
              <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center">
                DRAG_TO_MOVE // SCROLL_TO_ZOOM // ROTATE_CONTROLS
              </div>
            </TerminalWindow>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
