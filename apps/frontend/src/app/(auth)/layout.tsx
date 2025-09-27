import { Navigation } from 'lucide-react';
import Link from 'next/link';
import React, { FC } from 'react';

// Define the type for the component's props
interface AuthLayoutProps {
	children: React.ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
	return (
		<div className="flex min-h-screen flex-col bg-black text-white">
			{/* Header with app title/logo and branding */}
			<header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<Link className="flex items-center space-x-2 font-bold" href="/">
						<Navigation className="h-6 w-6 text-cyan-400" fill="#00707d" />
						<span>Horizon Comms</span>
					</Link>
					<div className="flex items-center space-x-4">
						<Link
							className="hidden text-sm hover:text-cyan-400 sm:block"
							href="/login"
						>
							Login
						</Link>
						{/* This button can be customized or linked to a signup page */}
						<Link
							href="/signup"
							className="rounded-md bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-sm font-semibold text-black transition-all hover:from-cyan-500 hover:to-violet-600"
						>
							Begin
						</Link>
					</div>
				</div>
			</header>

			{/* Main content container for the active auth page.
				It's now a flexible container that centers its children,
				allowing the page component to define its own layout and background.
			*/}
			<main className="flex flex-grow items-center justify-center p-4 pt-20">
				{children}
			</main>

			{/* Footer with copyright and legal info */}
			<footer className="text-center p-4 text-xs text-gray-500">
				&copy; {new Date().getFullYear()} Horizon Comms. All rights reserved.
			</footer>
		</div>
	);
};

export default AuthLayout;
