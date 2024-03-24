import {Injectable, Res, UnauthorizedException} from '@nestjs/common';
import {UsersService, UserStatus} from '../../users/services/users.service';
import {PrismaService} from 'src/prisma/prisma.servise';
import {HttpService} from '@nestjs/axios';
import {User} from '@prisma/client';
import {JwtService} from '@nestjs/jwt';
import {Response} from 'express';
import * as bcrypt from 'bcrypt';
import {SignUpDto} from '../dto/sign_up.dto';
import {ImageService} from 'src/users/services/image.service';
import * as qrcode from 'qrcode'
import * as speakeasy from 'speakeasy'

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private prisma: PrismaService,
		private httpService: HttpService,
		private jwtService: JwtService,
		private imageService : ImageService
	) {}

	async loginIntra(code: string, res: Response) {
		const params = new URLSearchParams();
		params.append('grant_type', 'authorization_code');
		params.append('client_id', process.env.CLIENT_ID);
		params.append('client_secret', process.env.CLIENT_SECRET);
		params.append('code', code);
		params.append('redirect_uri', process.env.CALLBACK_URL);
		params.append('state', 'dasdADSADSadq2eq2eawe3tw4454w5effseFsdf343ERrewrer');

		const access_token = await this.getIntraAccessToken(params);
		
		const userData = await this.getUserData(access_token);

		const user = await this.getOrCreateUser(userData);

		if (user.twoFAEnabled)
			return {need2FA: true, userID: user.id};

		await this.createJwtAndSetCookie(user.id, res);
		return {need2FA: false, userID: ''};
	}

	async loginPass(user: User, res: Response) {
		if (user.twoFAEnabled)
			return {need2FA: true, userID: user.id};

		await this.createJwtAndSetCookie(user.id, res);
		return {need2FA: false, userID: ''};
	}

	async validate2FACode(code: string, userID: string, res: Response) {
		const user: User = await this.usersService.findOne(userID);
		const secret = user.googleSecret;

		const verified = speakeasy.totp.verify({
			secret: secret,
			encoding: 'ascii',
			token: code
		});

		if (!verified)
			throw new UnauthorizedException('Wrong validation code');
	}

	async createUser(user: SignUpDto) {
		if (await this.usersService.findOneByName(user.username)) {
			throw new UnauthorizedException('User ' + user.username + ' already exists!');
		}

		await this.usersService.createUser({
			username: user.username,
			first_name: user.first_name,
			last_name: user.last_name,
			fortytwo_id: user.username,
			status: UserStatus.online,
			profilePic: 'default.jpg',
		});

		await this.setUserPassword(user.username, user.password);
	}

	async getIntraAccessToken(params: URLSearchParams) {
		const response = await this.httpService
			.post('https://api.intra.42.fr/oauth/token', params, { validateStatus: null })
			.toPromise();
		const data = response.data;
		if (!data['access_token']) {
			throw new UnauthorizedException('No access token received');
		}
		return data['access_token'];
	}

	async getUserData(accessToken: string) {
		const config = {
		  validateStatus: null,
		  headers: {
			Authorization: `Bearer ${accessToken}`,
		  },
		};

		const response = await this.httpService
		  .get('https://api.intra.42.fr/v2/me', config)
		  .toPromise();
		const data = response.data;
	  
		if (!data['id']) {
		  throw new UnauthorizedException('No data received');
		}

		return data;
	}

	async getOrCreateUser(userData: any): Promise<User> {
		let user: User | null = await this.usersService.findOneBy42Id(userData['id'].toString());

		if (!user) {
			const imageUrl = userData['image'].link;
			const saveFolderPath = '/app/BACK/uploads';

			let fileName = null;
			try {
				fileName = await this.imageService.saveImageLocally(imageUrl, saveFolderPath);
			} catch (error) {
				throw new Error("Bad image" + error.message);
			}

			user = await this.usersService.createUser({
				username: userData['login'],
				first_name: userData['first_name'],
				last_name: userData['last_name'],
				fortytwo_id: userData['id'],
				status: UserStatus.online,
				profilePic: fileName,
		  	});
		} else {
			await this.usersService.setStatus(user.id, UserStatus.online);
		}

		return user;
	}

	async createJwtAndSetCookie(userId: string, @Res() res: Response): Promise<Response> {
		const payload = { sub: userId };

		const token = await this.jwtService.signAsync(payload);
		const refresh_token = await this.jwtService.signAsync(payload, {expiresIn: '15d'});

		await this.updateAuthToken(userId, token);

		res.cookie('jwt-token', token);
		res.cookie('refresh-token', refresh_token);
		return res;
	}

	async checkJWT(token: string) {
		const payload = await this.jwtService.verifyAsync(
			token,
			{
				secret: process.env.JWT_SECRET
			}
		);

		if (!payload)
			throw new Error();
	}

	async updateAuthToken(userId: string, new_token: string) {
		const authToken = await this.prisma.authToken.findUnique({where: {userID: userId}});
		if (authToken) {
			authToken.token = new_token;
			await this.prisma.authToken.update({
				where: { userID: userId },
				data: authToken,
			});
		} else {
			await this.prisma.authToken.create({
				data: {
					token: new_token,
					userID: userId
				}
			});
		}
	}

	async setUserPassword(username: string, password: string) {
		const saltRounds = 10;
    	const hashedPassword = await bcrypt.hash(password, saltRounds);
		const user = await this.usersService.findOneByName(username);
		if (user) {
			user.password = hashedPassword;
			await this.prisma.user.update({
				where: {username: username},
				data: user
			});
		}
	}


	async validateUserPass(username: string, pass: string): Promise<any> {
		const user = await this.usersService.findOneByName(username);
		if (user) {
			const isPasswordValid = bcrypt.compare(pass, user.password);
			if (isPasswordValid)
				return user;
		}
		return null;
	}

	async logout(res: Response, user: User) {
		res.clearCookie('jwt-token');
		res.clearCookie('refresh-token');
		await this.usersService.setStatus(user.id, UserStatus.offline);
	}

	async refreshJwt(refresh_token: string, res: Response) {
		let userId;
		try {
			const payload = await this.jwtService.verifyAsync(
				refresh_token, {
					secret: process.env.JWT_SECRET
				}
			);

			if (!payload)
				throw new Error();
				
			userId = payload.sub;
		} catch (error) {
			res.clearCookie('jwt-token');
			res.clearCookie('refresh-token');
			throw new Error('Refresh jwt expired');
		}

		const payload = { sub: userId };
		const newToken = await this.jwtService.signAsync(payload);
		
		await this.updateAuthToken(userId, newToken);
		await this.usersService.setStatus(userId, UserStatus.online);
	
		return newToken;
	}

	async qrCodeGoogle(user: User) {
		const secret = user.googleSecret;

		const otpURL = speakeasy.otpauthURL({
			secret: secret,
			label: 'Trans ' + user.username,
			issuer: '',
		});
		return qrcode.toDataURL(otpURL);
	}
}