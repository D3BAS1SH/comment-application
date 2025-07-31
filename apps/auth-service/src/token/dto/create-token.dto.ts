import { IsNotEmpty, IsString } from "class-validator";
import { RefreshTokenDto } from "./create-refresh-token.dto";

export class CreateTokenDto extends RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    accessToken: string;
}
