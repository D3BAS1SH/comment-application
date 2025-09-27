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
