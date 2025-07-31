import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from "class-validator";
import { IsValidDomainConstraint } from "../validators/isValidDomain.validator";

export class LoginUser {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsEmail()
    @IsNotEmpty()
    @Validate(IsValidDomainConstraint)
    email: string;
}