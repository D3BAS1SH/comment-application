'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/features/workspace/components/sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Scanline } from '@/components/ui/scanline';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Reset mobile sidebar when route changes - using derived state pattern
  // to avoid linting issues with setState in useEffect
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-green-900 selection:text-green-400">
      <Scanline />
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-green-400 text-black shadow-lg shadow-green-400/20 md:hidden"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Main Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar isCollapsed={isCollapsed} />

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobile && isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-40 w-64 md:hidden"
              >
                <div className="h-full border-r border-green-400/20 bg-black shadow-2xl">
                  {/* Reuse Sidebar component logic but force expanded for mobile */}
                  <Sidebar isCollapsed={false} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'flex-1 transition-all duration-300',
            !isMobile && !isCollapsed ? 'pl-64' : !isMobile ? 'pl-20' : 'pl-0'
          )}
        >
          <div className="min-h-screen p-6 md:p-8">{children}</div>
        </motion.main>
      </div>

      {/* Desktop Collapse Toggle Overlay (Hidden Button) */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed left-[calc(var(--sidebar-width)-12px)] top-20 z-50 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-green-400/20 bg-black text-gray-400 hover:text-green-400 hover:border-green-400/50 transition-all"
          style={{
            left: isCollapsed ? '68px' : '244px',
            transition: 'left 0.3s ease-in-out',
          }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <X size={12} className="rotate-45" />
          ) : (
            <X size={12} />
          )}
        </button>
      )}
    </div>
  );
}
