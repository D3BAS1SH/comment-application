'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  MessageCircle,
  FileText,
  Palette,
  User,
  Settings,
  LogOut,
  Navigation,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/features/auth/hooks/use-auth';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  danger?: boolean;
}

const menuItems: SidebarItem[] = [
  { name: 'Home', href: '/home', icon: <Home size={20} /> },
  { name: 'Search', href: '/home/search', icon: <Search size={20} /> },
  { name: 'Chat', href: '/home/chat', icon: <MessageCircle size={20} /> },
  { name: 'Post', href: '/home/post', icon: <FileText size={20} /> },
  { name: 'Canvas', href: '/home/canvas', icon: <Palette size={20} /> },
  { name: 'Profile', href: '/home/profile', icon: <User size={20} /> },
  { name: 'Settings', href: '/home/settings', icon: <Settings size={20} /> },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // Execute logout action
      await logout();
      // Redirect to landing page or login page
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback redirect
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // The sidebar visibility is now managed by the parent layout component
  // We no longer return null here to allow it to be rendered in the mobile overlay

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 z-60 flex h-screen flex-col border-r border-green-400/20 bg-black font-mono text-gray-400 pb-12',
        'selection:bg-green-900 selection:text-green-400 shadow-[4px_0_24px_rgba(0,0,0,0.8)] md:flex',
        isMobile ? 'flex' : 'hidden'
      )}
    >
      {/* Scanline Effect */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-5">
        <div className="h-full w-full animate-scanline bg-[linear-gradient(to_bottom,transparent_50%,rgba(74,222,128,0.1)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* Branding */}
      <div className="flex h-16 items-center border-b border-green-400/10 px-6">
        <Link href="/" className="flex items-center gap-3">
          <Navigation className="h-6 w-6 text-cyan-400 shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-bold tracking-tighter text-white whitespace-nowrap"
              >
                [ ROOT_ACCESS ]
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 custom-scrollbar">
        <nav className="flex flex-col gap-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-sm px-3 py-2.5 transition-all duration-200 uppercase tracking-widest',
                    isActive
                      ? 'bg-green-400/10 text-green-400'
                      : 'hover:bg-white/5 hover:text-white',
                    isCollapsed ? 'justify-center px-2' : ''
                  )}
                >
                  <span
                    className={cn(
                      'flex-shrink-0',
                      isActive
                        ? 'text-green-400'
                        : 'text-gray-500 group-hover:text-green-400'
                    )}
                  >
                    {item.icon}
                  </span>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-[10px] font-medium whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-green-400"
                    />
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-4 hidden group-hover:block z-50 bg-black border border-green-400/20 px-2 py-1 text-[10px] whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions (Sign Out) */}
      <div className="mt-auto border-t border-green-400/10 p-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            'group flex w-full items-center gap-3 rounded-sm border border-red-500/20 px-3 py-3 text-red-500 transition-all hover:bg-red-500/10 hover:border-red-500/50',
            isCollapsed ? 'justify-center px-2' : '',
            isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
          )}
        >
          <LogOut
            size={18}
            className={cn('shrink-0', isLoggingOut && 'animate-pulse')}
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap"
              >
                {isLoggingOut ? 'PROCESS...' : 'EXEC_SIGNOUT'}
              </motion.span>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <div className="absolute left-full ml-4 hidden group-hover:block z-50 bg-black border border-red-500/20 px-2 py-1 text-[10px] text-red-500 whitespace-nowrap">
              {isLoggingOut ? 'PROCESS...' : 'EXEC_SIGNOUT'}
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
