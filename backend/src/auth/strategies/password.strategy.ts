import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class PasswordStrategy extends PassportStrategy(Strategy, 'password') {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<any> {
		console.log('Trying to sing up with password: ' + password + ' and login: ' + username);
		const user = await this.authService.validateUserPass(username, password);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
