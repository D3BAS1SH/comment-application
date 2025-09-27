'use client';

import React, { FC, useState } from 'react';
import { Mail, Lock, User, UploadCloud } from 'lucide-react';
import { FormInput } from '@/components/form-input';
import Link from 'next/link';
import Image from 'next/image';
import TextType from '@/components/TextType';

// Main Register Page Component
const RegisterPage: FC = () => {
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [firstName, setFirstName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	// Handles the file selection and creates a preview URL
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// Handles the form submission
	const handleSubmit = async (
		e: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		e.preventDefault();

		// In a real application, you would handle the Cloudinary upload here.
		console.log('Form submitted. Next steps:');

		if (imageFile) {
			console.log('1. Get a signed URL from your backend.');
			// const signatureResponse = await fetch('/api/sign-cloudinary-upload');
			// const { signature, timestamp, apiKey, cloudName } = await signatureResponse.json();

			console.log(
				'2. Upload the image file to Cloudinary using the signed URL.'
			);
			// const formData = new FormData();
			// formData.append('file', imageFile);
			// formData.append('signature', signature);
			// formData.append('timestamp', timestamp);
			// formData.append('api_key', apiKey);
			//
			// const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
			//   method: 'POST',
			//   body: formData,
			// });
			// const cloudinaryData = await cloudinaryResponse.json();
			// const imageUrl = cloudinaryData.secure_url;
			// console.log('Uploaded image URL:', imageUrl);

			console.log(
				'3. Submit the form data (including the image URL) to your registration endpoint.'
			);
		} else {
			console.log('Submit form data without an image URL.');
		}
	};

	return (
		<div className="grid h-full w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-lg md:grid-cols-2">
			{/* Left Column: Branding and Welcome Message */}
			<div className="hidden flex-col justify-center bg-gradient-to-br from-gray-900 to-black p-8 text-white md:flex">
				<div>
					<h1 className="text-4xl font-bold leading-tight">
						<TextType
							text={'Join the Horizon Community.'}
							cursorCharacter="●"
							typingSpeed={75}
							pauseDuration={1500}
							deletingSpeed={40}
							cursorBlinkDuration={0.5}
							loop
						/>
					</h1>
					<p className="mt-4 text-gray-400">
						Create an account to start your journey and connect with a global
						network
					</p>
				</div>
			</div>

			{/* Right Column: Registration Form */}
			<div className="flex flex-col justify-center p-8 md:p-12">
				<h2 className="mb-2 text-3xl font-bold text-white">Create Account</h2>
				<p className="mb-8 text-gray-400">
					Fill in the details below to get started.
				</p>

				<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
					{/* Image Upload */}
					<div className="flex flex-col items-center space-y-2">
						<label htmlFor="image-upload" className="cursor-pointer">
							<div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-cyan-400 transition-colors">
								{imagePreview ? (
									<Image
										src={imagePreview}
										alt="Profile preview"
										className="w-full h-full rounded-full object-cover"
									/>
								) : (
									<UploadCloud className="text-gray-500" size={32} />
								)}
							</div>
						</label>
						<input
							id="image-upload"
							type="file"
							className="hidden"
							accept="image/*"
							onChange={handleFileChange}
						/>
						<p className="text-xs text-gray-400">Upload a profile picture</p>
					</div>

					{/* First and Last Name */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							id="firstname"
							type="text"
							placeholder="First Name"
							icon={<User size={20} />}
							onChange={(e) => setFirstName(e.target.value)}
							value={firstName}
						/>
						<FormInput
							id="lastname"
							type="text"
							placeholder="Last Name"
							icon={<User size={20} />}
							onChange={(e) => setLastName(e.target.value)}
							value={lastName}
						/>
					</div>

					{/* Email */}
					<FormInput
						id="email"
						type="email"
						placeholder="you@example.com"
						icon={<Mail size={20} />}
						onChange={(e) => setEmail(e.target.value)}
						value={email}
					/>

					{/* Password */}
					<FormInput
						id="password"
						type="password"
						placeholder="••••••••"
						icon={<Lock size={20} />}
						onChange={(e) => setPassword(e.target.value)}
						value={password}
					/>

					<button
						type="submit"
						className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-center font-bold text-black shadow-lg transition-transform duration-200 hover:scale-105 hover:from-cyan-500 hover:to-violet-600 focus:outline-none focus:ring-4 focus:ring-cyan-400/50"
					>
						Create Account
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-gray-400">
					Already have an account?{' '}
					<Link
						href="/login"
						className="font-medium text-cyan-400 hover:underline"
					>
						Log in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default RegisterPage;
