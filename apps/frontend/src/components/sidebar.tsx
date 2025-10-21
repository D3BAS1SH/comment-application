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
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
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
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

export function Sidebar({ isOpen, onClose, isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar variants for desktop (slide from left)
  const desktopVariants = {
    hidden: { x: isCollapsed ? 0 : -280, opacity: isCollapsed ? 1 : 0 },
    visible: { x: 0, opacity: 1 },
  };

  // Sidebar variants for mobile (slide from top)
  const mobileVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const variants = isMobile ? mobileVariants : desktopVariants;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm top-16"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isMobile ? (isOpen ? 'visible' : 'hidden') : 'visible'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed z-40 h-screen border-r border-white/10 bg-black/80 backdrop-blur-xl',
          isCollapsed ? 'w-20' : 'w-64',
          isMobile
            ? 'top-16 left-0 right-0 h-auto w-full border-b border-r-0'
            : 'top-16 left-0 h-[calc(100vh-64px)]'
        )}
      >
        <div className={cn('flex flex-col', isMobile ? 'p-4' : 'p-6')}>
          {/* Close button for mobile */}
          {isMobile && (
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <span className="text-xs font-medium text-gray-400">Menu</span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Menu Items */}
          <nav
            className={cn(
              'flex gap-1',
              isMobile ? 'flex-row overflow-x-auto pb-2' : 'flex-col'
            )}
          >
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && onClose()}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 whitespace-nowrap',
                      isActive
                        ? 'bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-cyan-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5',
                      isCollapsed && !isMobile ? 'justify-center px-2' : '',
                      isMobile
                        ? 'flex-shrink-0 min-w-fit justify-center py-2 px-3'
                        : ''
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>

                    {!isCollapsed && !isMobile && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}

                    {isActive && !isMobile && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-cyan-400"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.div>
    </>
  );
}
