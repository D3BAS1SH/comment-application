interface ManPageHeaderProps {
  section?: string;
  manual?: string;
  date?: string;
}

/**
 * Man-Page style header component.
 * Displays terminal session info and the classic 3-column man header.
 */
export function ManPageHeader({
  section = 'HORIZONCOMMS(1)',
  manual = 'General Commands Manual',
  date = '2023-11-24',
}: ManPageHeaderProps) {
  return (
    <header className="mb-10 w-full max-w-5xl mx-auto">
      {/* Terminal Session Bar */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-sm" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
            Terminal Session: Horizoncomms_Manual
          </span>
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          LAST UPDATE: {date}
        </div>
      </div>

      {/* 3-Column Header */}
      <div className="flex justify-between items-baseline font-bold text-gray-300">
        <span className="uppercase">{section}</span>
        <span className="hidden md:inline uppercase text-sm tracking-widest">
          {manual}
        </span>
        <span className="uppercase">{section}</span>
      </div>
    </header>
  );
}
