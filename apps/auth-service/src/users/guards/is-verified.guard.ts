import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserResponse } from "../dto/get-user-response.dto";

@Injectable()
export class IsVerifedGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user: UserResponse = request.user;

        if(!user){
            throw new UnauthorizedException("Authentication required");
        }

        if(!user.isVerfied){
            throw new UnauthorizedException("Access denied: Email isn't verified");
        }

        return true;
    }
}