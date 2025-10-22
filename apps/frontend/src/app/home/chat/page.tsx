'use client';

import { motion } from 'framer-motion';
import {
  FintechCard,
  FintechCardHeader,
  FintechCardTitle,
} from '@/components/fintech-card';
import { Clock } from 'lucide-react';

export default function ChatPage() {
  const skeletonItems = Array.from({ length: 6 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      key="chat-page"
    >
      <h1 className="text-3xl font-bold tracking-tighter mb-8">Chat</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List Skeleton */}
        <FintechCard variant="glass">
          <FintechCardHeader>
            <FintechCardTitle>Conversations</FintechCardTitle>
          </FintechCardHeader>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <Clock size={20} className="text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Coming Soon</p>
                <p className="text-gray-400 text-sm">
                  Chat feature launching soon
                </p>
              </div>
            </div>

            {skeletonItems.slice(0, 3).map((_, index) => (
              <div
                key={index}
                className="p-3 bg-white/5 rounded-lg animate-pulse space-y-2"
              >
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </FintechCard>

        {/* Chat Window Skeleton */}
        <FintechCard variant="glass" className="lg:col-span-2">
          <FintechCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/6"></div>
              </div>
            </div>
          </FintechCardHeader>

          <div className="p-6 space-y-4 h-96">
            {skeletonItems.map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`p-3 rounded-lg ${index % 2 === 0 ? 'bg-white/5' : 'bg-cyan-500/20'} max-w-xs animate-pulse`}
                >
                  <div className="h-4 bg-white/10 rounded w-32"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </FintechCard>
      </div>
    </motion.div>
  );
}
