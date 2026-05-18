'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
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
  const overlayVisible = isMobile && isSidebarOpen;
  const pathname = usePathname();

  // Close mobile sidebar on route change
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

        {/* Mobile Sidebar Overlay — CSS transitions instead of framer-motion */}
        {isMobile && (
          <>
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-200"
              style={{
                opacity: overlayVisible ? 1 : 0,
                pointerEvents: overlayVisible ? 'auto' : 'none',
              }}
            />
            <div
              className="fixed inset-y-0 left-0 z-40 w-64 md:hidden transition-transform duration-300 ease-in-out"
              style={{
                transform: isSidebarOpen
                  ? 'translateX(0)'
                  : 'translateX(-280px)',
              }}
            >
              <div className="h-full border-r border-green-400/20 bg-black shadow-2xl">
                <Sidebar isCollapsed={false} />
              </div>
            </div>
          </>
        )}

        {/* Main Content — CSS opacity transition instead of motion.main */}
        <main
          className={cn(
            'flex-1 transition-all duration-300 animate-fadeIn',
            !isMobile && !isCollapsed ? 'pl-64' : !isMobile ? 'pl-20' : 'pl-0'
          )}
          style={{ animation: 'layoutFadeIn 0.3s ease forwards' }}
        >
          <style>{`
            @keyframes layoutFadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>
          <div className="min-h-screen p-6 md:p-8">{children}</div>
        </main>
      </div>

      {/* Desktop Collapse Toggle */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 z-50 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-green-400/20 bg-black text-gray-400 hover:text-green-400 hover:border-green-400/50 transition-all"
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
