'use client';

import {
  Navigation,
  Menu,
  Home,
  Search,
  MessageCircle,
  FileText,
  User,
  Settings,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface AppNavbarProps {
  onMenuToggle: () => void;
  showBrand?: boolean;
}

const mobileMenuItems = [
  { name: 'Home', href: '/home', icon: <Home size={18} /> },
  { name: 'Search', href: '/home/search', icon: <Search size={18} /> },
  { name: 'Chat', href: '/home/chat', icon: <MessageCircle size={18} /> },
  { name: 'Post', href: '/home/post', icon: <FileText size={18} /> },
  // { name: 'Canvas', href: '/home/canvas', icon: <Palette size={18} /> },
  { name: 'Profile', href: '/home/profile', icon: <User size={18} /> },
  { name: 'Settings', href: '/home/settings', icon: <Settings size={18} /> },
];

export function AppNavbar({ onMenuToggle, showBrand = true }: AppNavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  const handleMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleDesktopToggle = () => {
    setShowMobileMenu(false);
    onMenuToggle();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl transition-opacity duration-300">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Menu button - Visible on all screen widths */}
            {showBrand && (
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    handleMenuToggle();
                  } else {
                    handleDesktopToggle();
                  }
                }}
                className="text-gray-400 hover:text-cyan-400 transition-colors flex hover:scale-110 active:scale-95"
                title="Toggle Menu"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}

            <Link className="flex items-center space-x-2 font-bold" href="/">
              <Navigation className="h-6 w-6 text-cyan-400" />
              <span className="hidden sm:inline">Horizon Comms</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {showBrand && (
              <button className="text-[10px] font-mono uppercase tracking-widest text-gray-500 border border-gray-700 hover:border-red-500 hover:text-red-400 px-3 py-1.5 transition-colors">
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu - Icon Only Navigation */}
        {showBrand && showMobileMenu && window.innerWidth < 768 && (
          <div className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-xl overflow-hidden transition-all duration-200">
            <div className="flex flex-wrap gap-2 p-4">
              {mobileMenuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div
                      className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-cyan-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                      title={item.name}
                    >
                      {item.icon}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
