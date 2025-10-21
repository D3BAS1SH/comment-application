'use client';

import { motion } from 'framer-motion';
import {
  FintechCard,
  FintechCardHeader,
  FintechCardTitle,
} from '@/components/fintech-card';
import { Palette, Clock, Save, Download } from 'lucide-react';
import { FintechButton } from '@/components/fintech-button';

export default function CanvasPage() {
  const toolbarItems = ['Pen', 'Shapes', 'Text', 'Layers', 'Effects'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold tracking-tighter mb-8">Canvas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Toolbar Skeleton */}
        <FintechCard variant="glass" className="lg:col-span-1">
          <FintechCardHeader>
            <FintechCardTitle className="text-lg">Tools</FintechCardTitle>
          </FintechCardHeader>

          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <Clock size={20} className="text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">
                  Canvas Coming Soon
                </p>
                <p className="text-gray-400 text-xs">
                  Creative tools launching soon
                </p>
              </div>
            </div>

            {toolbarItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-white/5 rounded-lg animate-pulse hover:bg-white/10 transition-colors cursor-not-allowed"
              >
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </motion.div>
            ))}
          </div>
        </FintechCard>

        {/* Canvas Area Skeleton */}
        <FintechCard variant="glass" className="lg:col-span-3">
          <FintechCardHeader>
            <div className="flex items-center justify-between">
              <FintechCardTitle className="flex items-center gap-2">
                <Palette size={20} />
                Canvas Workspace
              </FintechCardTitle>
              <div className="flex gap-2">
                <FintechButton variant="outline" size="sm" disabled>
                  <Save size={16} />
                </FintechButton>
                <FintechButton variant="outline" size="sm" disabled>
                  <Download size={16} />
                </FintechButton>
              </div>
            </div>
          </FintechCardHeader>

          <div className="px-6 pb-6">
            {/* Canvas Preview Skeleton */}
            <div className="w-full h-96 bg-gradient-to-br from-white/5 to-white/2 rounded-lg border border-white/10 animate-pulse flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="text-center"
              >
                <Palette size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">
                  Canvas workspace loading...
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Creative tools will be available soon
                </p>
              </motion.div>
            </div>

            {/* Properties Skeleton */}
            <div className="mt-6 space-y-4">
              <div className="text-sm font-medium text-white">Properties</div>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-3 bg-white/10 rounded w-1/4 animate-pulse"></div>
                  <div className="h-8 bg-white/5 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </FintechCard>
      </div>
    </motion.div>
  );
}
