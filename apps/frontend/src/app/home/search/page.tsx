'use client';

import { useState } from 'react';
import { Search, Clock } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const skeletonItems = Array.from({ length: 5 });

  return (
    <div className="space-y-6 font-mono">
      <div className="border-l-4 border-green-400 pl-4 py-1">
        <h1 className="text-xl font-bold tracking-widest uppercase text-white">
          Search
        </h1>
        <p className="text-gray-600 text-xs mt-1">query module</p>
      </div>

      {/* Search input */}
      <div className="border border-green-800 bg-black flex items-center gap-3 px-4 py-3 focus-within:border-green-500 transition-colors">
        <Search size={16} className="text-green-600 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search transactions, recipients, services..."
          disabled
          className="flex-1 bg-transparent text-green-300 text-sm placeholder-gray-700 focus:outline-none font-mono disabled:cursor-not-allowed"
        />
        <span className="text-[10px] text-gray-700 uppercase tracking-widest">
          disabled
        </span>
      </div>

      {/* Coming soon + skeleton */}
      <div className="space-y-3 max-w-2xl">
        <div className="flex items-center gap-3 border border-green-900 bg-black/40 px-4 py-4">
          <Clock size={16} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
              Feature Coming Soon
            </p>
            <p className="text-gray-600 text-[10px] mt-0.5">
              Search functionality will be available shortly
            </p>
          </div>
        </div>

        {skeletonItems.map((_, i) => (
          <div
            key={i}
            className="border border-green-900/40 bg-black/30 p-4 space-y-1.5 animate-pulse"
          >
            <div className="h-3 bg-green-900/30 rounded w-3/4" />
            <div className="h-2.5 bg-green-900/20 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
