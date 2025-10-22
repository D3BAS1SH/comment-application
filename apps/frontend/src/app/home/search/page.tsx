'use client';

import { motion } from 'framer-motion';
import { FintechCard, FintechCardHeader } from '@/components/fintech-card';
import { FintechInput } from '@/components/fintech-input';
import { Search, Clock } from 'lucide-react';

export default function SearchPage() {
  const skeletonItems = Array.from({ length: 5 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      key="search-page"
    >
      <h1 className="text-3xl font-bold tracking-tighter mb-8">Search</h1>

      <FintechCard variant="glass" className="mb-8">
        <FintechCardHeader>
          <FintechInput
            variant="minimal"
            placeholder="Search transactions, recipients, or services..."
            icon={<Search size={18} />}
            disabled
          />
        </FintechCardHeader>
      </FintechCard>

      {/* Coming Soon Skeleton */}
      <div className="space-y-4 max-w-2xl">
        <FintechCard variant="glass">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Clock size={24} className="text-cyan-400" />
              <div>
                <p className="text-white font-semibold text-lg">
                  Feature Coming Soon
                </p>
                <p className="text-gray-400 text-sm">
                  Search functionality will be available shortly
                </p>
              </div>
            </div>

            {skeletonItems.map((_, index) => (
              <div
                key={index}
                className="p-4 bg-white/5 rounded-lg space-y-2 animate-pulse"
              >
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </FintechCard>
      </div>
    </motion.div>
  );
}
