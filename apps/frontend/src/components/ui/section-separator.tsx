import { cn } from '@/lib/utils';

interface SectionSeparatorProps {
  label: string;
  className?: string;
}

/**
 * Terminal section divider: >>> LABEL ──────────
 */
export function SectionSeparator({ label, className }: SectionSeparatorProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 flex items-center gap-4 border-y border-gray-800',
        className
      )}
    >
      <span className="text-green-900 font-bold">&gt;&gt;&gt;</span>
      <span className="text-green-400 font-bold tracking-[0.2em] uppercase">
        {label}
      </span>
      <div className="flex-grow border-t border-dashed border-gray-800" />
    </div>
  );
}
