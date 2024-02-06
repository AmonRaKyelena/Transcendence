import { Controller, Post, Get, HttpCode, HttpStatus, UnauthorizedException, Headers, Res, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SetMetadata } from '@nestjs/common';
import { OAuthGuard } from '../guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { RefreshAuthGuard } from '../guards/refresh-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { JWTAuthGuard } from '../guards/auth-jwt.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService,
				private jwtService: JwtService) {}

	@Get('loginIntraCode')
	@UseGuards(OAuthGuard)
	loginIntraCode() {
	}

	@HttpCode(HttpStatus.OK)
	@Post('loginIntra')
	async loginIntra(@Headers('Code') code: string,
					 @Req() req: Request,
					 @Res() res: Response) {
		try {
			if (!code)
				throw new UnauthorizedException();

			let token: string;
			let refresh_token: string;
			if (req.cookies['jwt-token']) {
				token = req.cookies['jwt-token'];
			} else {
				const tokens = await this.authService.loginIntra(code);
				token = tokens.token;
				refresh_token = tokens.refresh_token;
				res.cookie('jwt-token', token, { httpOnly: true, secure: true });
				res.cookie('refresh-token', refresh_token, { httpOnly: true, secure: true });
			}

			return res.json({ token });
		}
		catch (error) {
			console.log('loginIntra endpoint: ' + error.message);
			return res.status(500).json({ message: 'Internal server error ' + error.message });
		}
	}

	@UseGuards(RefreshAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Get('refreshJwt')
	async refreshJwt(@Res() res: Response,
			   @Req() req: Request) {
		if (!req['user']) {
			console.log('no user');
			return res.json({error: 'No refresh token'});
		}

		try {
			const new_token = await this.authService.refreshJwt(req['user']);
			res.cookie('jwt-token', new_token, { httpOnly: true, secure: true });

			return res.json({ token: new_token });
		} catch (error) {
			console.log('refreshJwt endpoint: ' + error.message);

			return res.status(500).json({ message: 'Internal server error ' + error.message });
		}
	}

	@UseGuards(JWTAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Get('logout')
	logout(@Req() req: Request,
		   @Res() res: Response) {
		this.authService.logout(res, req['user']);
		return res.json({ logout: 'logout' });
	}

	@UseGuards(JWTAuthGuard)
	@Get('checkJWT')
	checkJWT() {
		return 'JWT token is avaible';
	}

	@Get('allUsers')
	allUsersTest() {
		return this.authService.allClients();
	}

	@Get('allTokens')
	allTokensTest() {
		return this.authService.allTokens();
	}
}