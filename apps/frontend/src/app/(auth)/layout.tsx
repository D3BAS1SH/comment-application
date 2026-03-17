import { Navigation } from 'lucide-react';
import Link from 'next/link';
import React, { FC } from 'react';
import { FintechButton } from '@/components/fintech-button';

// Define the type for the component's props
interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/30">
      {/* Header with app title/logo and branding */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            className="flex items-center space-x-2 font-bold group"
            href="/"
          >
            <div className="p-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
              <Navigation
                className="h-5 w-5 text-cyan-400"
                fill="currentColor"
                fillOpacity={0.2}
              />
            </div>
            <span className="tracking-tight text-lg">Horizon Comms</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              className="hidden text-sm font-medium text-gray-400 hover:text-white transition-colors sm:block"
              href="/login"
            >
              Sign In
            </Link>
            <Link href="/register">
              <FintechButton
                variant="primary"
                size="sm"
                className="font-semibold shadow-lg shadow-cyan-500/10"
              >
                Get Started
              </FintechButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content container */}
      <main className="flex flex-grow items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-6xl">{children}</div>
      </main>

      {/* Footer with copyright and legal info */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-500 bg-black/30">
        <div className="container mx-auto">
          <p>
            &copy; {new Date().getFullYear()} Horizon Comms. Engineered for
            connection.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
