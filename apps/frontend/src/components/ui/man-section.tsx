import type React from 'react';

interface ManSectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * A reusable manual section component with a green heading and hanging indent content.
 */
export function ManSection({ title, children }: ManSectionProps) {
  return (
    <div className="mb-8 w-full max-w-5xl mx-auto">
      <h2 className="text-green-400 font-bold mb-2 uppercase tracking-widest">
        {title}
      </h2>
      <div className="pl-4 md:pl-16 text-gray-400 leading-relaxed font-mono">
        {children}
      </div>
    </div>
  );
}
