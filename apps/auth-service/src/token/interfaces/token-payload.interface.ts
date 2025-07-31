interface tokenPayload {
    sub: string;
    email: string;
    isVerified: boolean;
    iat?: number;
    exp?: number;
}