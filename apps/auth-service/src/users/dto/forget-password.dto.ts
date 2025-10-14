import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsValidDomainConstraint } from '../validators/isValidDomain.validator';

@Exclude()
export class ForgetPasswordBodyDto {
  @Expose()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @Validate(IsValidDomainConstraint)
  email: string;
}
