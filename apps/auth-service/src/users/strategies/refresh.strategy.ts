import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { RefreshTokenResponse } from "../dto/refresh-token-reponse.dto";
import { Request } from "express";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy,'jwt-refresh'){
    constructor(
        private readonly configService: ConfigService
    ){
        super({
            secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET')!,
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    if( req && req.cookies){
                        return req.cookies.refreshToken
                    }
                    return null
                },
                (req: Request) => {
                    if( req && req.body ){
                        return req.body.refreshToken
                    }
                    return null
                }
            ]),
            ignoreExpiration: false,
            passReqToCallback: true
        })
    }

    async validate(req: Request, payload: tokenPayload): Promise<RefreshTokenResponse>{

        console.log("validated payload");
        var refreshToken: string;
        if(req.cookies){
            refreshToken=req.cookies.refreshToken;
        } else if(req.body){
            refreshToken= req.body.refreshToken;
        } else {
            throw new BadRequestException("RefreshToken not found");
        }
        if(!refreshToken){
            throw new BadRequestException("The refresh Token was not found");
        }

        return {
            ...payload,
            refreshToken:refreshToken
        };
    }
}