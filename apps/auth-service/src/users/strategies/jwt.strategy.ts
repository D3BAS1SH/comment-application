import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from "src/prisma/prisma.service";
import { UserResponse } from "../dto/get-user-response.dto";
import { plainToInstance } from "class-transformer";

interface JwtPayload {
    sub: string;
    email: string;
    isVerified: boolean;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!
        })
    }

    async validate(payload: JwtPayload): Promise<UserResponse> {
        const user = await this.prisma.user.findUnique({
            where:{
                id: payload.sub
            }
        })

        if(!user){
            throw new UnauthorizedException("User not found");
        }

        if(!user.isVerified){
            throw new UnauthorizedException("User is not verified. Please Check your inbox or verify yourself.");
        }

        if(user.deletedAt){
            throw new UnauthorizedException("User is deleted or deactive");
        }

        return plainToInstance(UserResponse,user,{
            excludeExtraneousValues:true
        })
    }
}