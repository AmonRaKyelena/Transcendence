import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
  
@Injectable()
export class RefreshAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService,
				private authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();
		const token = request.cookies['refresh-token'];

		// If client doesn't have refresh-token, we do nothing.
		if (!token) {
			request['user'] = null;
			return true;
		}

		try {
			const payload = await this.jwtService.verifyAsync(
				token, {
					secret: process.env.JWT_SECRET
				}
			);
			request['user'] = payload;
		} catch {
			this.authService.logout(context.switchToHttp().getResponse(), request['user']);
			throw new UnauthorizedException();
		}
		return true;
	}
}