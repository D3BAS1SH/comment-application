import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsValidDomainConstraint } from '../validators/isValidDomain.validator';
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @Validate(IsValidDomainConstraint)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least of 8 character long.',
  })
  password: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
