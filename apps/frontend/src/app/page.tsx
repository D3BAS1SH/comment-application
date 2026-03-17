'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LineChart,
  Lock,
  Navigation,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppNavbar } from '@/components/app-navbar';
import { FintechButton } from '@/components/fintech-button';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
      {/* Navigation */}
      <AppNavbar onMenuToggle={() => {}} showBrand={false} />

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Curved SVG Lines for tech feel */}
          <svg
            className="absolute h-full w-full opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="grad1" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
              d="M -100 200 Q 400 50 900 300 T 1400 100"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="1"
            />
          </svg>

          {/* Ambient Glows */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute -right-1/4 top-1/2 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]"
          />
        </div>

        {/* Content */}
        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mx-auto max-w-4xl space-y-10"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400/80">
                Premium Experience
              </span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-[1.1]">
              Horizon Comms
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed">
              Connect effortlessly. Create boundlessly. Share instantly. The
              all-in-one platform for modern communities and high-performance
              teams.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <FintechButton
                variant="primary"
                size="lg"
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto px-8 py-6 text-lg group shadow-xl shadow-cyan-500/10"
              >
                Join Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </FintechButton>

              <FintechButton
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg border-white/10 text-white hover:bg-white/5"
              >
                Learn More
              </FintechButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 py-32 bg-black overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]"></div>
        <div className="container px-4 relative">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              Core Capabilities
            </h2>
            <div className="h-1.5 w-20 bg-gradient-to-r from-cyan-400 to-violet-500 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-400 text-lg">
              Engineered with modern microservices to deliver a lag-free,
              scalable environment.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <CreditCard className="h-10 w-10 text-cyan-400" />,
                title: 'Real-Time Chat',
                desc: 'Instant peer communication with sub-second latency via WebSockets. Seamless syncing everywhere.',
                color: 'cyan',
              },
              {
                icon: <LineChart className="h-10 w-10 text-violet-400" />,
                title: 'Interactive Canvas',
                desc: 'Brainstorm and visualize ideas in real-time. The ultimate space for remote creative sessions.',
                color: 'violet',
              },
              {
                icon: <Lock className="h-10 w-10 text-cyan-400" />,
                title: 'Posts & Threads',
                desc: 'Share complex updates and engage through deep, threaded discussions managed by scalable logic.',
                color: 'cyan',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div
                  className={`mb-6 p-4 rounded-2xl bg-white/[0.03] w-fit group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container px-4">
          <div className="relative mx-auto max-w-5xl rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-gray-900 to-black p-12 lg:p-20 text-center overflow-hidden">
            {/* CTA Background patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 blur-[100px] -ml-32 -mb-32"></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-8">
                Ready to transform <br />
                <span className="text-cyan-400">your workflow?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-gray-400 text-lg mb-12">
                Join thousands of creators and professionals building the future
                on Horizon Comms.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <FintechButton
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/register')}
                  className="w-full sm:w-auto px-10"
                >
                  Join Now
                </FintechButton>

                <div className="flex flex-col items-start space-y-2 text-left sm:ml-8">
                  {[
                    'Built with extreme transparency',
                    '99.9% Uptime guaranteed',
                    'Pure microservice power',
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 text-sm text-gray-400"
                    >
                      <CheckCircle2 size={16} className="text-cyan-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-16">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <Navigation className="h-6 w-6 text-cyan-400 transition-transform group-hover:rotate-12" />
              <span className="font-bold text-xl tracking-tighter">
                Horizon Comms
              </span>
            </Link>

            <div className="flex items-center space-x-12">
              <Link
                className="text-sm text-gray-500 hover:text-white transition-colors"
                href="#"
              >
                Privacy
              </Link>
              <Link
                className="text-sm text-gray-500 hover:text-white transition-colors"
                href="#"
              >
                Terms
              </Link>
              <Link
                className="text-sm text-gray-500 hover:text-white transition-colors"
                href="#"
              >
                Support
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} Horizon Comms. A premium communication
            suite.
          </div>
        </div>
      </footer>
    </div>
  );
}
