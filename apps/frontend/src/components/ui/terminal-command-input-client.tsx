'use client';

import dynamic from 'next/dynamic';

// Loaded only on the client — never evaluated during SSR prerendering.
// This breaks the module-evaluation chain that causes the TDZ crash.
const TerminalCommandInput = dynamic(
  () =>
    import('@/components/ui/terminal-command-input').then(
      (m) => m.TerminalCommandInput
    ),
  { ssr: false }
);

export function TerminalCommandInputClient() {
  return <TerminalCommandInput />;
}
