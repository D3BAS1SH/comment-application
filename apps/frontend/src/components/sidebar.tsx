'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  MessageCircle,
  FileText,
  Palette,
  User,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
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
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render sidebar on mobile - menu is in navbar instead
  if (isMobile) {
    return null;
  }

  const desktopVariants = {
    hidden: { x: isCollapsed ? 0 : -280, opacity: isCollapsed ? 1 : 0 },
    visible: { x: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={desktopVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed z-40 h-[calc(100vh-64px)] border-r border-white/10 bg-black/80 backdrop-blur-xl top-16 left-0 hidden md:block',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col p-6">
        {/* Menu Items */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive =
              window.location.pathname === item.href ||
              window.location.pathname.startsWith(item.href + '/');

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-cyan-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                    isCollapsed ? 'justify-center px-2' : ''
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>

                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {isActive && (
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
  );
}
