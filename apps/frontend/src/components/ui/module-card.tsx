'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type PatternType = 'dots' | 'lines' | 'diagonal' | 'geometric' | 'grid';

interface ModuleCardProps {
  index: number;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  command: string;
  patternType?: PatternType;
  watermark: string;
  frameLabel: string;
}

const patternStyles: Record<PatternType, React.CSSProperties> = {
  dots: {
    backgroundImage: 'radial-gradient(#4ade80 0.5px, transparent 0.5px)',
    backgroundSize: '10px 10px',
  },
  lines: {
    backgroundImage:
      'repeating-linear-gradient(0deg, #f0abfc 0px, #f0abfc 1px, transparent 1px, transparent 10px)',
  },
  diagonal: {
    backgroundImage:
      'linear-gradient(45deg, #facc15 25%, transparent 25%, transparent 50%, #facc15 50%, #facc15 75%, transparent 75%, transparent)',
    backgroundSize: '20px 20px',
  },
  geometric: {},
  grid: {
    backgroundImage:
      'linear-gradient(rgba(239,68,68,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.2) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  },
};

/**
 * Two-column feature module card with alternating layout.
 * Text side: tag, title, description, code snippet.
 * Visual side: framebuffer pattern with watermark.
 */
export function ModuleCard({
  index,
  tag,
  tagColor,
  title,
  description,
  command,
  patternType = 'dots',
  watermark,
  frameLabel,
}: ModuleCardProps) {
  const isEven = index % 2 === 0;

  const textContent = (
    <div className={cn('space-y-4', isEven ? 'order-2 md:order-1' : '')}>
      <div className={cn('font-bold text-lg', tagColor)}>{tag}</div>
      <h2 className="text-white text-3xl font-bold uppercase tracking-tight">
        {title}
      </h2>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
      <div className="pt-2">
        <code className="text-xs bg-gray-900 p-2 border border-gray-800 block font-mono">
          {command}
        </code>
      </div>
    </div>
  );

  const visualContent = (
    <div
      className={cn(
        'bg-gray-900 border border-gray-800 h-64 flex items-center justify-center overflow-hidden relative',
        isEven ? 'order-1 md:order-2' : ''
      )}
    >
      {patternType === 'geometric' ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border border-blue-900/40 rotate-45" />
          <div className="w-48 h-48 border border-blue-900/20 absolute rotate-12" />
        </div>
      ) : (
        <div
          className="absolute inset-0 opacity-10"
          style={patternStyles[patternType]}
        />
      )}
      <div className="text-gray-700 text-6xl opacity-20">{watermark}</div>
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-600">
        {frameLabel}
      </div>
    </div>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="grid md:grid-cols-2 gap-12 items-center"
    >
      {isEven ? (
        <>
          {textContent}
          {visualContent}
        </>
      ) : (
        <>
          {visualContent}
          {textContent}
        </>
      )}
    </motion.article>
  );
}
