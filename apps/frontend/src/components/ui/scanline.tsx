'use client';

/**
 * CRT scanline overlay effect for terminal aesthetic.
 * Fixed position, covers the entire viewport, pointer-events-none.
 */
export function Scanline() {
  return (
    <div
      className="fixed top-0 left-0 w-full h-[2px] z-50 pointer-events-none"
      style={{
        background: 'rgba(74, 222, 128, 0.05)',
        animation: 'scanline 4s linear infinite',
      }}
    />
  );
}
