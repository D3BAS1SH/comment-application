'use client';

import React, { useState, useEffect } from 'react';

/**
 * A character-based terminal spinner (/ - \ |).
 */
export const TerminalSpinner: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const frames = ['/', '-', '\\', '|'];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, [frames.length]);

  return (
    <span className="inline-block w-[1ch] font-mono">{frames[frame]}</span>
  );
};
