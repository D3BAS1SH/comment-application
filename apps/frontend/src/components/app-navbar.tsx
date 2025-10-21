'use client';

import { motion } from 'framer-motion';
import { Navigation, Menu } from 'lucide-react';
import Link from 'next/link';

interface AppNavbarProps {
  onMenuToggle: () => void;
  showBrand?: boolean;
}

export function AppNavbar({ onMenuToggle, showBrand = true }: AppNavbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Menu button - Visible on all screen widths */}
          {showBrand && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuToggle}
              className="text-gray-400 hover:text-cyan-400 transition-colors flex"
              title="Toggle Sidebar"
            >
              <Menu size={24} />
            </motion.button>
          )}

          <Link className="flex items-center space-x-2 font-bold" href="/">
            <Navigation className="h-6 w-6 text-cyan-400" />
            <span className="hidden sm:inline">Horizon Comms</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {showBrand && (
            <button className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
              Sign Out
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
