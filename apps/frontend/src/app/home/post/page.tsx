'use client';

import { motion } from 'framer-motion';
import { FintechCard, FintechCardHeader } from '@/components/fintech-card';
import { Clock, Heart, MessageCircle, Share2 } from 'lucide-react';

export default function PostPage() {
  const skeletonPosts = Array.from({ length: 3 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold tracking-tighter mb-8">Posts</h1>

      {/* Post Creation Skeleton */}
      <FintechCard variant="glass" className="mb-6 max-w-2xl mx-auto">
        <FintechCardHeader>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-10 bg-white/5 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </FintechCardHeader>
      </FintechCard>

      {/* Posts Feed Skeleton */}
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-lg border border-white/10 justify-center">
          <Clock size={20} className="text-cyan-400" />
          <div>
            <p className="text-white font-semibold">
              Posts Feature Coming Soon
            </p>
            <p className="text-gray-400 text-sm">
              Share your thoughts and connect with others
            </p>
          </div>
        </div>

        {skeletonPosts.map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <FintechCard variant="glass">
              <FintechCardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/6"></div>
                  </div>
                </div>
              </FintechCardHeader>

              <div className="px-6 pb-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
                <div className="h-32 bg-white/5 rounded-lg animate-pulse mt-4"></div>
              </div>

              <div className="px-6 py-4 flex gap-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 cursor-pointer">
                  <Heart size={18} />
                  <span className="text-sm">12</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 cursor-pointer">
                  <MessageCircle size={18} />
                  <span className="text-sm">5</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 cursor-pointer">
                  <Share2 size={18} />
                  <span className="text-sm">3</span>
                </div>
              </div>
            </FintechCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
