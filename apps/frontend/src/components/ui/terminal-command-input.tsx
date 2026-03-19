'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BlinkingCursor } from '@/features/auth/components/blinking-cursor';

const COMMANDS: Record<string, string> = {
  'cd manuals': '/about',
  './man.sh': '/about',
  help: '/about',
  './login.sh': '/login',
  './register.sh': '/register',
};

/**
 * A global terminal input component that sticks to the bottom of the screen.
 * It takes specific commands and redirects to different pages.
 */
export function TerminalCommandInput() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();

    if (COMMANDS[cmd]) {
      setFeedback(`EXECUTING: ${cmd}...`);
      setTimeout(() => {
        router.push(COMMANDS[cmd]);
        setInput('');
        setFeedback(null);
      }, 500);
    } else if (cmd) {
      setFeedback(`command not found: ${cmd}`);
      setTimeout(() => setFeedback(null), 2000);
      setInput('');
    }
  };

  // Keyboard shortcut to focus (Ctrl + ` is common, but let's just make it focus on click for now)
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-gray-800 font-mono text-sm group"
    >
      <div
        className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 cursor-text"
        onClick={handleContainerClick}
      >
        <div className="flex items-center gap-1 shrink-0 select-none">
          <span className="text-green-500 font-bold">user</span>
          <span className="text-gray-500">@</span>
          <span className="text-blue-400">horizon</span>
          <span className="text-gray-500">:</span>
          <span className="text-yellow-500">~</span>
          <span className="text-gray-400 underline underline-offset-4 decoration-green-500/30">
            $
          </span>
        </div>

        <form
          onSubmit={handleCommand}
          className="flex-grow relative flex items-center h-8"
        >
          <div className="absolute inset-0 flex items-center pointer-events-none whitespace-pre select-none overflow-hidden">
            <span
              className={cn(
                'text-green-400 transition-opacity',
                feedback ? 'opacity-0' : 'opacity-100'
              )}
            >
              {input}
            </span>
            {!input && !feedback && (
              <span className="text-gray-700 italic opacity-50">
                Type &apos;help&apos; or commands here...
              </span>
            )}
            {!feedback && (isFocused || !input) && (
              <BlinkingCursor className="w-[0.5em] h-[1.1em] ml-0" />
            )}
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'absolute inset-0 flex items-center pointer-events-none select-none',
                  feedback.startsWith('EXECUTING')
                    ? 'text-cyan-400'
                    : 'text-red-500'
                )}
              >
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent border-none text-transparent caret-transparent focus:ring-0 outline-none p-0 font-mono h-full"
            autoComplete="off"
            spellCheck="false"
          />
        </form>

        <div className="hidden md:flex items-center gap-4 shrink-0 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-pulse" />
            SECURE_LINK
          </div>
          <div className="opacity-30">TTY1</div>
        </div>
      </div>
    </motion.div>
  );
}
