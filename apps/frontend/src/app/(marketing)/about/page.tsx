'use client';

import Link from 'next/link';
import { ManPageHeader } from '@/components/ui/man-page-header';
import { ManSection } from '@/components/ui/man-section';
import { ManPageFooter } from '@/components/ui/man-page-footer';

/**
 * About Page - Styled as a Unix Man Page (Manual).
 */
export default function AboutPage() {
  return (
    <main className="w-full flex flex-col items-center p-4 md:p-8 bg-black min-h-screen">
      <div className="w-full max-w-5xl p-6 md:p-10">
        <ManPageHeader />

        <ManSection title="NAME">
          HORIZONCOMMS - A highly scalable orchestration environment for
          decentralized communication.
        </ManSection>

        <ManSection title="SYNOPSIS">
          <strong>horizoncomms</strong> [<em>OPTIONS</em>] [<em>MODULE</em>]...
        </ManSection>

        <ManSection title="DESCRIPTION">
          <div className="space-y-4">
            <p>
              <strong>Horizoncomms</strong> is a high-performance, low-latency
              communication layer designed for secure data exchange across
              distributed nodes. It integrates collaborative canvases, real-time
              chat protocols, and task orchestration into a single, unified
              terminal interface.
            </p>
            <p>
              The system operates on a decentralized backbone, ensuring that no
              single point of failure can disrupt the orchestration of complex
              workflows. By leveraging a proprietary mesh protocol,{' '}
              <span className="text-green-400/80">horizoncomms</span> achieves
              sub-50ms latency for global state synchronization.
            </p>
          </div>
        </ManSection>

        <ManSection title="OPTIONS">
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2 md:gap-8">
              <span className="font-bold min-w-[150px]">-c, --canvas</span>
              <span>Initialize the collaborative visual workspace.</span>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-8">
              <span className="font-bold min-w-[150px]">-s, --secure</span>
              <span>Enable end-to-end quantum-resistant encryption.</span>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-8">
              <span className="font-bold min-w-[150px]">-o, --orchestrate</span>
              <span>
                Deploy automated task handlers for project management.
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-8">
              <span className="font-bold min-w-[150px]">-v, --verbose</span>
              <span>Output detailed debug logs to stdout.</span>
            </div>
          </div>
        </ManSection>

        <ManSection title="CORE FEATURES">
          <div className="space-y-2">
            {[
              'Zero-Knowledge Identity Verification',
              'Real-time Multi-user Terminal Buffers',
              'Automated Module Scaling via Node Clustering',
              'Integrated API Gateway for External Protocol Hooks',
            ].map((feature) => (
              <div key={feature} className="flex gap-4">
                <span className="text-gray-600">[ ]</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </ManSection>

        <ManSection title="AUTHOR">
          Written by root &lt;sysadmin@horizoncomms.io&gt;.
        </ManSection>

        <ManSection title="REPORTING BUGS">
          Report bugs to the internal issue tracker at{' '}
          <a
            href="https://github.com/horizoncomms/core/issues"
            className="underline decoration-gray-700 hover:text-green-400"
          >
            https://github.com/horizoncomms/core/issues
          </a>
        </ManSection>

        <ManSection title="COPYRIGHT">
          Copyright © 2024 Horizoncomms. This is free software; see the source
          for copying conditions. There is NO warranty; not even for
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
        </ManSection>

        <ManPageFooter />

        {/* Quick Nav Links */}
        <div className="w-full max-w-5xl mt-12 flex flex-wrap gap-4 text-xs font-bold uppercase">
          {['HELP(7)', 'NETWORK(8)', 'SECURITY(1)', 'INSTALL(1)'].map(
            (link) => (
              <Link
                key={link}
                href="#"
                className="border border-gray-800 px-3 py-1 hover:bg-green-400 hover:text-black transition-colors"
              >
                {link}
              </Link>
            )
          )}
        </div>
      </div>
    </main>
  );
}
