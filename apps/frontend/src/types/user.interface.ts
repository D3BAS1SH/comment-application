export interface UserState {
	id: string | null;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	imageUrl: string | null;
	isVerified: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	loading: boolean;
	error: string | null;
}

export interface UserLogin {
	email: string;
	password: string;
}

export interface UserRegister {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	imageUrl?: string;
}