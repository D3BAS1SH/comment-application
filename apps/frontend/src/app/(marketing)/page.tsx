'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Terminal UI Components
import { TerminalWindow } from '@/components/ui/terminal-window';
import { SectionSeparator } from '@/components/ui/section-separator';
import { ModuleCard } from '@/components/ui/module-card';

const modules = [
  {
    tag: '[01] OPERATIONAL',
    tagColor: 'text-cyan-400',
    title: 'Task Management Kernel',
    description:
      'Priority scheduling via heuristic task allocation. Monitor workflow pipelines with zero latency. The kernel manages thread distribution and process priority across all sub-systems in real-time.',
    command: 'sh ./scripts/init_task_scheduler.sh --force',
    patternType: 'dots' as const,
    watermark: '[ OPER ]',
    frameLabel: 'FR_01_TASK',
    image: '/images/task_oper.png',
  },
  {
    tag: '[02] DISTRIBUTION',
    tagColor: 'text-purple-400',
    title: 'Post Broadcast Protocol',
    description:
      'Mass-packet transmission across multiple edge nodes. Deploy content packages with automated synchronization. Supports multi-casting and peer-to-peer relay validation.',
    command: 'curl -X POST /api/v1/broadcast -d @payload.json',
    patternType: 'lines' as const,
    watermark: '[ DIST ]',
    frameLabel: 'FR_02_BROADCAST',
    image: '/images/post_broadcast.png',
  },
  {
    tag: '[03] COMM_LINK',
    tagColor: 'text-yellow-400',
    title: 'Chat Protocol Layer',
    description:
      'Encrypted messaging via secure sockets. Low-latency peer communication with end-to-end verification. Zero-retention policy for all active sessions.',
    command: 'telnet irc.horizoncomms.net 6667',
    patternType: 'diagonal' as const,
    watermark: '[ COMM ]',
    frameLabel: 'FR_03_NET_CHAT',
    image: '/images/chat_system.png',
  },
  {
    tag: '[04] ANALYTICS',
    tagColor: 'text-blue-400',
    title: 'Canvas Visualization',
    description:
      'Real-time vector rendering of complex data structures. Map node dependencies and network traffic through hardware-accelerated framebuffer outputs.',
    command: 'glxgears -info >> /dev/null',
    patternType: 'geometric' as const,
    watermark: '[ VISUAL ]',
    frameLabel: 'FR_04_GPU_RENDER',
    image: '/images/canvas_vis.png',
  },
  {
    tag: '[05] SYSTEM_LOG',
    tagColor: 'text-red-400',
    title: 'Activity Logger',
    description:
      'Immutable audit trails for every packet. Tracking user interactions, system failures, and security events across the entire deployment stack.',
    command: 'tail -f /var/log/horizon/access.log',
    patternType: 'grid' as const,
    watermark: '[ LOG ]',
    frameLabel: 'FR_05_AUDIT',
    image: '/images/activity_logger.png',
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <main>
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center p-4 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl"
        >
          <TerminalWindow>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-5xl font-bold text-green-400">
                INITIATING SYSTEM...
                <span className="terminal-blink">_</span>
              </h1>
              <p className="text-sm md:text-base text-gray-500 max-w-2xl leading-relaxed">
                Deployment build:{' '}
                <span className="text-gray-300">v4.0.2-stable</span>. <br />
                Encrypted connection established via 256-bit AES. <br />
                <span className="text-yellow-600 underline">WARNING:</span> All
                actions are logged to kernel-01.local.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => router.push('/login')}
                className="bg-green-400 text-black px-8 py-3 font-bold hover:bg-green-300 transition-colors uppercase tracking-tighter"
              >
                EXECUTE_LOGIN
              </button>
              <button
                onClick={() => router.push('/about')}
                className="bg-transparent border border-green-400 text-green-400 px-8 py-3 font-bold hover:bg-green-400/10 transition-colors uppercase tracking-tighter"
              >
                READ_DOCS
              </button>
            </div>
          </TerminalWindow>
        </motion.div>
      </section>

      {/* Module Separator */}
      <SectionSeparator label="AVAILABLE_MODULES" />

      {/* Core Modules */}
      <section id="modules" className="max-w-6xl mx-auto py-20 px-6 space-y-32">
        {modules.map((mod, index) => (
          <ModuleCard key={index} index={index} {...mod} />
        ))}
      </section>
    </main>
  );
}
