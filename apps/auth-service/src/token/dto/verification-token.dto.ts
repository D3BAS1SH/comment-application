import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class VerificationTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  userId: string;

  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;
}
