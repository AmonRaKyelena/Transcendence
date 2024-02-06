import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
	handleRequest<User>(error: any, user: User): User {
		if (error || !user)
			throw new UnauthorizedException('JWTAuth guard failed.');
		return user;
	}
}