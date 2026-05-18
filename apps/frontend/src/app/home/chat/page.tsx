'use client';

import { Clock } from 'lucide-react';

export default function ChatPage() {
  const skeletonItems = Array.from({ length: 6 });

  return (
    <div className="space-y-6 font-mono">
      <div className="border-l-4 border-green-400 pl-4 py-1">
        <h1 className="text-xl font-bold tracking-widest uppercase text-white">
          Chat
        </h1>
        <p className="text-gray-600 text-xs mt-1">messaging module</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversations List */}
        <div className="border border-green-900 bg-black/40">
          <div className="px-4 py-3 border-b border-green-900">
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
              {/* conversations */}
            </p>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-green-900/50">
              <Clock size={16} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-400 text-xs font-bold">Coming Soon</p>
                <p className="text-gray-600 text-[10px]">Chat launching soon</p>
              </div>
            </div>
            {skeletonItems.slice(0, 3).map((_, i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="h-3 bg-green-900/30 rounded w-2/3" />
                <div className="h-2.5 bg-green-900/20 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="border border-green-900 bg-black/40 lg:col-span-2">
          <div className="px-4 py-3 border-b border-green-900 flex items-center gap-3">
            <div className="w-7 h-7 bg-green-900/40 rounded-sm animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-green-900/30 rounded w-1/4" />
              <div className="h-2.5 bg-green-900/20 rounded w-1/6" />
            </div>
          </div>
          <div className="p-4 space-y-3 h-80">
            {skeletonItems.map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`px-3 py-2 border animate-pulse max-w-[200px] ${
                    i % 2 === 0
                      ? 'border-green-900 bg-green-900/10'
                      : 'border-cyan-900 bg-cyan-900/10'
                  }`}
                >
                  <div className="h-3 bg-white/5 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
