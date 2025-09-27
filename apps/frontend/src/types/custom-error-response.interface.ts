export interface CustomErrorResponseDto {
	statusCode: number;
	timestamp: string;
	path: string;
	message: string;
	errorCode?: string;
}
