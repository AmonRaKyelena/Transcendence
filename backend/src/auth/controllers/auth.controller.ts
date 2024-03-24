import { Controller, Post, Get, HttpCode, HttpStatus, UnauthorizedException, Headers, Res, Req, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SetMetadata } from '@nestjs/common';
import { OAuthGuard } from '../guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JWTAuthGuard } from '../guards/auth-jwt.guard';
import { PassGuard } from '../guards/pass.guard';
import { SignUpDto } from '../dto/sign_up.dto';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

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

			let data;
			data = await this.authService.loginIntra(code, res);

			return res.status(200).json({ need2FA: data.need2FA, userID: data.userID });
		} catch (error) {
			return res.status(500).json({ message: 'Internal server error ' + error.message });
		}
	}

	@UseGuards(PassGuard)
	@HttpCode(HttpStatus.OK)
	@Post('loginPass')
	async loginPass (@Req() req: Request,
					 @Res() res: Response) {
		try {
			if (!req['user'])
				throw new UnauthorizedException();
			
			let data;
			data = await this.authService.loginPass(req['user'], res);

			return res.json({ need2FA: data.need2FA, userID: data.userID });
		} catch (error) {
			return res.status(500).json({ message: 'Internal server error ' + error.message });
		}
	}

	@Post('signUpPass')
	@HttpCode(HttpStatus.OK)
	async signUpPass(@Body() signUpDto: SignUpDto, @Res() res: Response) {
		try {
			await this.authService.createUser(signUpDto);
			return res.json({ res: 'user has been created' });
		} catch (error) {
			return res.status(500).json({ message: error.message });
		}
	}

	@HttpCode(HttpStatus.OK)
	@Get('refreshJwt')
	async refreshJwt(@Res() res: Response,
			  		 @Req() req: Request) {
		if (!req.cookies['refresh-token']) {
			res.clearCookie('jwt-token');
			return res.json({res: 'Error'});
		}
		
		try {
			const new_token = await this.authService.refreshJwt(req.cookies['refresh-token'], res);
			res.cookie('jwt-token', new_token);

			return res.status(200).json({res: 'Success'});
		} catch (error) {
			return res.status(200).json({res: 'Error'});
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

	@Get('checkJWT')
	async checkJWT(@Req() req: Request) {
		try {
			if (!req.cookies['jwt-token'])
				throw new Error();
			await this.authService.checkJWT(req.cookies['jwt-token']);
			return {res: 'Success'};
		} catch(error) {
			return {res: 'Error'};
		}
	}

	@Post('validate2FA')
	async validate2FA(@Body() body, @Res() res: Response, @Req() req: Request) {
		try {
			await this.authService.validate2FACode(body['code'], body['userID'], res);
			if (!req.cookies['jwt-token']) {
				await this.authService.createJwtAndSetCookie(body['userID'], res);
			}
			return res.status(200).json('Authorized');
		} catch (error) {
			return res.status(200).json('Not authorized');
		}
	}

	@UseGuards(JWTAuthGuard)
	@Get('qrCodeGoogle')
	async qrCodeGoogle(@Req() req: Request) {
		return { code: await this.authService.qrCodeGoogle(req['user']) };
	}

}