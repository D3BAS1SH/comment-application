'use client';

import { Clock, Heart, MessageCircle, Share2 } from 'lucide-react';

export default function PostPage() {
  const skeletonPosts = Array.from({ length: 3 });

  return (
    <div className="space-y-6 font-mono">
      <div className="border-l-4 border-green-400 pl-4 py-1">
        <h1 className="text-xl font-bold tracking-widest uppercase text-white">
          Posts
        </h1>
        <p className="text-gray-600 text-xs mt-1">activity feed</p>
      </div>

      {/* Create post skeleton */}
      <div className="border border-green-900 bg-black/40 p-4 max-w-2xl mx-auto flex items-center gap-3">
        <div className="w-8 h-8 bg-green-900/30 animate-pulse flex-shrink-0" />
        <div className="flex-1 h-8 bg-green-900/20 animate-pulse" />
      </div>

      {/* Coming soon notice */}
      <div className="flex items-center gap-3 border border-cyan-900 bg-black/40 px-4 py-3 max-w-2xl mx-auto">
        <Clock size={16} className="text-green-600 flex-shrink-0" />
        <div>
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
            Posts Feature Coming Soon
          </p>
          <p className="text-gray-600 text-[10px]">
            Share your thoughts and connect with others
          </p>
        </div>
      </div>

      {/* Post skeletons */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {skeletonPosts.map((_, i) => (
          <div key={i} className="border border-green-900 bg-black/40">
            {/* Post header */}
            <div className="flex items-center gap-3 p-4 border-b border-green-900">
              <div className="w-8 h-8 bg-green-900/30 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-green-900/30 rounded w-1/4 animate-pulse" />
                <div className="h-2.5 bg-green-900/20 rounded w-1/6 animate-pulse" />
              </div>
            </div>
            {/* Post body */}
            <div className="p-4 space-y-2">
              <div className="h-3 bg-green-900/20 rounded w-full animate-pulse" />
              <div className="h-3 bg-green-900/20 rounded w-5/6 animate-pulse" />
              <div className="h-24 bg-green-900/10 animate-pulse mt-3" />
            </div>
            {/* Post actions */}
            <div className="flex gap-6 px-4 py-3 border-t border-green-900">
              <button className="flex items-center gap-1.5 text-gray-600 hover:text-green-400 text-[10px] uppercase transition-colors">
                <Heart size={14} />
                <span>12</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-600 hover:text-green-400 text-[10px] uppercase transition-colors">
                <MessageCircle size={14} />
                <span>5</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-600 hover:text-green-400 text-[10px] uppercase transition-colors">
                <Share2 size={14} />
                <span>3</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
