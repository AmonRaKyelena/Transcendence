import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OAuthGuard extends AuthGuard('auth') {
	handleRequest<User>(error: any, user: User): User {
		if (error || !user)
		throw new UnauthorizedException('OAuth guard failed.');
		return user;
	}
}