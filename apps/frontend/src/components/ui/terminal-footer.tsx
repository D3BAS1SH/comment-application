/**
 * Terminal status-bar footer.
 * Shows copyright, location, and system status with pulsing indicator.
 */
export function TerminalFooter() {
  return (
    <footer className="border-t border-gray-800 bg-black px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-widest text-gray-500 font-bold font-mono">
      <div className="uppercase">
        © 1998-{new Date().getFullYear()} HORIZONCOMMS INTERFACE. NO RIGHTS
        RESERVED. COPYLEFT BYPASSED.
      </div>
      <div className="text-gray-600">
        LOC: <span className="text-white">127.0.0.1</span>
      </div>
      <div className="flex items-center gap-2">
        SYS_STATUS: <span className="text-green-400">OPTIMAL</span>
        <div className="w-2 h-2 bg-green-400 animate-pulse" />
      </div>
    </footer>
  );
}
