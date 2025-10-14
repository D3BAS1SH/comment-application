import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class UserResponse {
  @IsString()
  @Expose()
  id: string;

  @IsString()
  @Expose()
  firstName: string;

  @IsString()
  @Expose()
  lastName: string;

  @IsEmail()
  @Expose()
  email: string;

  @IsOptional()
  @IsUrl()
  @Expose()
  imageUrl?: string;

  @IsDate()
  @IsOptional()
  @Expose()
  createdAt?: Date;

  @IsBoolean()
  @Expose()
  isVerfied: boolean;

  @Exclude()
  password: string;

  @Exclude()
  deletedAt: string;
}
