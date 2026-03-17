'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  FintechCard,
  FintechCardContent,
  FintechCardHeader,
} from '@/components/fintech-card';

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <FintechCard key={i} variant="default">
          <FintechCardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
          </FintechCardHeader>
          <FintechCardContent>
            <Skeleton className="h-4 w-24 mb-2 rounded" />
            <Skeleton className="h-8 w-32 rounded" />
          </FintechCardContent>
        </FintechCard>
      ))}
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0"
        >
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-6 w-24 rounded" />
        </div>
      ))}
    </div>
  );
}
