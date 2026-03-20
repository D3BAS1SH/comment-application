'use client';

interface ManPageFooterProps {
  version?: string;
  date?: string;
}

/**
 * Man-Page style footer component.
 * Features the 3-column footer and interactive search prompt.
 */
export function ManPageFooter({
  version = 'Horizoncomms 1.0.4-stable',
  date = '2024-10-12',
}: ManPageFooterProps) {
  return (
    <footer className="mt-16 w-full max-w-5xl mx-auto font-mono">
      {/* 3-Column Footer */}
      <div className="flex justify-between items-baseline border-t border-gray-800 pt-4 mb-10 text-gray-500 font-bold">
        <span>{version}</span>
        <span className="hidden md:inline">{date}</span>
        <span>HORIZONCOMMS(1)</span>
      </div>

      {/* Interactive Search-Like Prompt */}
      <div className="bg-gray-900/30 p-3 flex items-center gap-2 border-l-2 border-green-400">
        <span className="text-green-400 font-bold">:</span>
        <span className="text-gray-500 animate-pulse font-bold">_</span>
        <span className="text-[10px] text-gray-600 ml-auto font-bold uppercase tracking-widest">
          (END)
        </span>
      </div>
    </footer>
  );
}
