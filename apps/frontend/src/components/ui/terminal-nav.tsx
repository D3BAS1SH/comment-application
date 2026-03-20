'use client';

import Link from 'next/link';

interface NavLink {
  label: string;
  href: string;
  danger?: boolean;
}

interface TerminalNavProps {
  links?: NavLink[];
}

const defaultLinks: NavLink[] = [
  { label: './HOME', href: '/' },
  { label: './MANUAL', href: '/about' },
  { label: './SECURE_VAULT', href: '/login' },
  { label: './SETUP_VAULT', href: '/register', danger: true },
];

/**
 * Terminal-styled sticky navbar.
 * Brand: [ ROOT_ACCESS ] @horizoncomms:~$ ls ./HOME
 * Links: uppercase terminal paths
 */
export function TerminalNav({ links = defaultLinks }: TerminalNavProps) {
  return (
    <nav className="border-b border-gray-800 bg-black sticky top-0 z-40 px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4 font-mono">
      <div className="text-green-400 font-bold" aria-label="Brand">
        [ ROOT_ACCESS ] @horizoncomms:~${' '}
        <span className="text-white">ls ./HOME</span>
      </div>
      <div className="flex flex-wrap gap-6 text-sm uppercase">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={
              link.danger
                ? 'text-red-500 hover:bg-red-950 transition-colors px-1'
                : 'text-gray-400 hover:text-green-400 transition-colors'
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
