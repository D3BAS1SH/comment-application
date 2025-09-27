'use client';

import { motion } from 'framer-motion';
import {
	ArrowRight,
	CheckCircle2,
	CreditCard,
	LineChart,
	Lock,
	Navigation,
	Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
	return (
		<div className="min-h-screen bg-black text-white">
			{/* Navigation */}
			<header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
				<div className="container flex h-16 items-center justify-between px-4">
					<Link className="flex items-center space-x-2 font-bold" href="/">
						<Navigation className="h-6 w-6 text-cyan-400" />
						<span>Horizon Comms</span>
					</Link>
					<div className="flex items-center space-x-4">
						<Link
							className="hidden text-sm hover:text-cyan-400 sm:block"
							href="/login"
						>
							Login
						</Link>
						<Button className="bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:from-cyan-500 hover:to-violet-600">
							Begin
						</Button>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
				{/* Animated Elements */}
				<div className="absolute inset-0 overflow-hidden">
					{/* Curved Lines */}
					<svg
						className="absolute h-full w-full"
						xmlns="http://www.w3.org/2000/svg"
					>
						<defs>
							<linearGradient id="grad1" x1="1" y1="0" x2="0" y2="0">
								<stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
								<stop offset="50%" stopColor="#22d3ee" stopOpacity="0.5" />
								<stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
							</linearGradient>
							<linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
								<stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
								<stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
								<stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
							</linearGradient>
						</defs>
						{/* Top Curves */}
						<motion.path
							initial={{ pathLength: 0, opacity: 0 }}
							animate={{ pathLength: 1, opacity: 1 }}
							transition={{
								duration: 2,
								ease: 'easeInOut',
								repeat: Number.POSITIVE_INFINITY,
								repeatType: 'loop',
								repeatDelay: 1,
							}}
							d="M 100 100 Q 300 0 500 100 T 900 100"
							fill="none"
							stroke="url(#grad1)"
							strokeWidth="1"
						/>
						<motion.path
							initial={{ pathLength: 0, opacity: 0 }}
							animate={{ pathLength: 1, opacity: 1 }}
							transition={{
								duration: 2,
								ease: 'easeInOut',
								repeat: Number.POSITIVE_INFINITY,
								repeatType: 'loop',
								repeatDelay: 1,
								delay: 0.5,
							}}
							d="M 0 200 Q 200 100 400 200 T 800 200"
							fill="none"
							stroke="url(#grad2)"
							strokeWidth="1"
						/>
						{/* Bottom Curves */}
						<motion.path
							initial={{ pathLength: 0, opacity: 0 }}
							animate={{ pathLength: 1, opacity: 1 }}
							transition={{
								duration: 2,
								ease: 'easeInOut',
								repeat: Number.POSITIVE_INFINITY,
								repeatType: 'loop',
								repeatDelay: 1,
								delay: 1,
							}}
							d="M 100 600 Q 300 500 500 600 T 900 600"
							fill="none"
							stroke="url(#grad1)"
							strokeWidth="1"
						/>
					</svg>

					{/* Straight Lines */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1 }}
						className="absolute inset-0"
					>
						{[...Array(3)].map((_, i) => (
							<motion.div
								key={i}
								initial={{ x: '100%', opacity: 0 }}
								animate={{
									x: '-100%',
									opacity: [0, 0.7, 0.7, 0],
								}}
								transition={{
									duration: 2.5,
									delay: i * 0.2,
									repeat: Number.POSITIVE_INFINITY,
									repeatType: 'loop',
									ease: 'linear',
								}}
								className="absolute right-0"
								style={{
									top: `${15 + i * 10}%`,
									height: '1px',
									width: '100%',
									background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? '#22d3ee' : '#8b5cf6'}60, transparent)`,
								}}
							/>
						))}
					</motion.div>
				</div>

				{/* Animated Background */}
				<div className="absolute inset-0 z-[1]">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 2 }}
						className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl"
					/>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 2, delay: 0.5 }}
						className="absolute -right-1/4 top-1/2 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl"
					/>
				</div>

				{/* Content */}
				<div className="container relative z-[3] px-4 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1 }}
						className="mx-auto max-w-3xl space-y-8"
					>
						<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
							Dinero Global en Movimiento
						</h1>
						<p className="mx-auto max-w-2xl text-muted text-gray-400 sm:text-xl">
							Nuestra plataforma le permite a tu negocio tener acceso a rieles
							de pagos internacionales en segundos en vez de horas
						</p>
						<div className="flex justify-center space-x-4">
							<Button className="bg-gradient-to-r from-cyan-400 to-violet-500 text-lg text-black hover:from-cyan-500 hover:to-violet-600">
								Comenzar
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
							<Button
								variant="outline"
								className="border-white/10 text-lg text-white hover:bg-white/10"
							>
								Saber Más
							</Button>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="relative z-10 border-t border-white/10 bg-black py-24"
			>
				<div className="container px-4">
					<div className="mb-16 text-center">
						<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
							¿Por Qué Elegirnos?
						</h2>
						<p className="mt-4 text-gray-400">
							Experimenta la banca que funciona para ti
						</p>
					</div>
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							viewport={{ once: true }}
							className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-cyan-400/50"
						>
							<CreditCard className="mb-4 h-12 w-12 text-cyan-400" />
							<h3 className="mb-2 text-xl font-bold">Smart Cards</h3>
							<p className="text-gray-400">
								Tarjetas virtuales y físicas con controles avanzados y
								notificaciones en tiempo real.
							</p>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							viewport={{ once: true }}
							className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-violet-400/50"
						>
							<LineChart className="mb-4 h-12 w-12 text-violet-400" />
							<h3 className="mb-2 text-xl font-bold">
								Inversiones Inteligentes
							</h3>
							<p className="text-gray-400">
								Estrategias de inversión automatizadas adaptadas a tus objetivos
								financieros.
							</p>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							viewport={{ once: true }}
							className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-cyan-400/50"
						>
							<Lock className="mb-4 h-12 w-12 text-cyan-400" />
							<h3 className="mb-2 text-xl font-bold">Seguridad Bancaria</h3>
							<p className="text-gray-400">
								Seguridad de nivel empresarial con encriptación de extremo a
								extremo y autenticación biométrica.
							</p>
						</motion.div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative z-10 border-t border-white/10 bg-black py-24">
				<div className="container px-4">
					<div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/50 to-violet-950/50 p-8 text-center backdrop-blur-sm md:p-12 lg:p-16">
						<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
							¿Listo para Comenzar?
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-gray-400">
							Únete a miles de clientes satisfechos que confían en nosotros para
							sus necesidades bancarias.
						</p>
						<ul className="mx-auto mt-8 flex max-w-xl flex-col gap-4 text-left">
							<li className="flex items-center space-x-3">
								<CheckCircle2 className="h-5 w-5 text-cyan-400" />
								<span>Sin comisiones ni cargos ocultos</span>
							</li>
							<li className="flex items-center space-x-3">
								<CheckCircle2 className="h-5 w-5 text-cyan-400" />
								<span>Soporte al cliente 24/7</span>
							</li>
							<li className="flex items-center space-x-3">
								<CheckCircle2 className="h-5 w-5 text-cyan-400" />
								<span>Plataforma segura y regulada</span>
							</li>
						</ul>
						<Button className="mt-8 bg-gradient-to-r from-cyan-400 to-violet-500 text-lg text-black hover:from-cyan-500 hover:to-violet-600">
							Abre tu Cuenta
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-white/10 bg-black py-8">
				<div className="container flex flex-col items-center justify-between space-y-4 px-4 md:flex-row md:space-y-0">
					<div className="flex items-center space-x-2">
						<Wallet className="h-6 w-6 text-cyan-400" />
						<span className="font-bold">Ares</span>
					</div>
					<p className="text-sm text-gray-400">
						© {new Date().getFullYear()} Ares. Todos los derechos reservados.
					</p>
					<div className="flex space-x-6">
						<Link
							className="text-sm text-gray-400 hover:text-cyan-400"
							href="#"
						>
							Privacidad
						</Link>
						<Link
							className="text-sm text-gray-400 hover:text-cyan-400"
							href="#"
						>
							Términos
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
