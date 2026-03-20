'use client';

import { motion } from 'framer-motion';
import {
  FintechCard,
  FintechCardContent,
  FintechCardHeader,
  FintechCardTitle,
} from '@/components/ui/fintech-card';
import {
  BarChart3,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Terminal as TerminalIcon,
  Shield,
  Activity,
  Cpu,
} from 'lucide-react';
import { TerminalWindow } from '@/components/ui/terminal-window';

export default function HomePage() {
  const stats = [
    {
      title: 'Active Session Time',
      value: '04:22:15',
      change: 'STABLE',
      icon: <Activity className="h-6 w-6 text-cyan-400" />,
      positive: true,
    },
    {
      title: 'Kernel Load',
      value: '12.4%',
      change: 'LOW',
      icon: <Cpu className="h-6 w-6 text-violet-400" />,
      positive: true,
    },
    {
      title: 'Firewall Status',
      value: 'ACTIVE',
      change: 'SECURE',
      icon: <Shield className="h-6 w-6 text-green-400" />,
      positive: true,
    },
  ];

  const logEntries = [
    {
      timestamp: '18:05:22',
      event: 'USER_LOGIN',
      status: 'SUCCESS',
      source: '192.168.1.45',
    },
    {
      timestamp: '18:06:01',
      event: 'KEY_ROTATION',
      status: 'COMPLETED',
      source: 'LOCAL_KERNEL',
    },
    {
      timestamp: '18:06:45',
      event: 'CONNECTION_RETRY',
      status: 'RESOLVED',
      source: 'EDGE_NODE_01',
    },
    {
      timestamp: '18:07:02',
      event: 'SYSTEM_AUDIT',
      status: 'PASS',
      source: 'CRON_JOB',
    },
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* Terminal Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-l-4 border-green-400 pl-4 py-2"
      >
        <div className="flex items-center gap-2 text-green-400 text-xs font-bold tracking-widest uppercase">
          <TerminalIcon size={14} />
          <span>System Status: Operational</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tighter mt-1 text-white">
          Welcome, <span className="text-green-400">User</span>@horizon-comms:~$
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Last login: Fri Mar 20 18:02:11 on ttys001
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="group relative border border-green-400/20 bg-black p-6 transition-all hover:border-green-400/40">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/5 rounded-sm">{stat.icon}</div>
                <div className="text-[10px] bg-green-400/10 text-green-400 px-2 py-0.5 font-bold tracking-tighter">
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stat.value}
                </p>
              </div>
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-green-400/40" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-green-400/40" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Terminal Window for Activity */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <TerminalWindow
          title="system_monitor --mode real-time"
          className="max-w-none"
          bodyClassName="p-0 space-y-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-3 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">
                    Event Type
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">
                    Payload Status
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">
                    Source Node
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logEntries.map((log, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-green-400/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500 tabular-nums">
                      [{log.timestamp}]
                    </td>
                    <td className="px-6 py-4 font-bold text-cyan-400">
                      {log.event}
                    </td>
                    <td className="px-6 py-4 text-green-400">{log.status}</td>
                    <td className="px-6 py-4 text-gray-400 italic">
                      {log.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Footer Area */}
          <div className="p-4 border-t border-white/5 bg-black">
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <span className="animate-pulse">●</span>
              <span>LIVE_DATA_STREAM INITIATED...</span>
            </div>
          </div>
        </TerminalWindow>
      </motion.div>
    </div>
  );
}
