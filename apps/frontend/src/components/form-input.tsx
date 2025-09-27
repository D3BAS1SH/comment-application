import { FC, ReactNode } from 'react';

// TypeScript interface for the props of the FormInput component
interface FormInputProps {
	icon: ReactNode;
	type: string;
	placeholder: string;
	id: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	value: string | number;
}

// Reusable Input component for the form, now strongly typed
export const FormInput: FC<FormInputProps> = ({
	icon,
	type,
	placeholder,
	id,
	onChange,
	value,
}) => (
	<div className="relative flex items-center">
		<div className="absolute left-3 text-gray-400">{icon}</div>
		<input
			type={type}
			id={id}
			placeholder={placeholder}
			className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
			required
			onChange={onChange}
			value={value}
		/>
	</div>
);
