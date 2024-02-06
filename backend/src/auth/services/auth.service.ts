import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserStatus, UsersService } from '../../users/services/users.service';
import { PrismaService } from 'src/prisma/prisma.servise';
import { HttpService } from '@nestjs/axios';
import { AuthToken, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private prisma: PrismaService,
		private httpService: HttpService,
		private jwtService: JwtService
	) {}

	async loginIntra(code: string) {
		const params = new URLSearchParams();
		params.append('grant_type', 'authorization_code');
		params.append('client_id', process.env.CLIENT_ID);
		params.append('client_secret', process.env.CLIENT_SECRET);
		params.append('code', code);
		params.append('redirect_uri', 'http://localhost:3000/auth');
		params.append('state', 'dasdADSADSadq2eq2eawe3tw4454w5effseFsdf343ERrewrer');

		const access_token = await this.getAccessToken(params);
		
		const userData = await this.getUserData(access_token);

		const {user, registered} = await this.getOrCreateUser(userData);

		const payload = { sub: user.id, username: user.username };

		const token = await this.jwtService.signAsync(payload);
		const refresh_token = await this.jwtService.signAsync(payload, {expiresIn: '15d'});

		this.updateAuthToken(user.id, token);

		return {token, refresh_token};
	}

	async getAccessToken(params: URLSearchParams) {
		const response = await this.httpService
			.post('https://api.intra.42.fr/oauth/token', params, { validateStatus: null })
			.toPromise();
		const data = response.data;
	
		if (!data['access_token']) {
			throw new UnauthorizedException('No access token received by this code');
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
		  throw new UnauthorizedException('No data received from intra');
		}
	  
		return data;
	}

	async getOrCreateUser(userData: any) {
		let user: User | null = await this.usersService.findOneBy42Id(userData['id'].toString());
		let registered: boolean;

		if (!user) {
			user = await this.usersService.createUser({
				username: userData['login'],
				first_name: userData['first_name'],
				last_name: userData['last_name'],
				fortytwo_id: userData['id'],
				status: UserStatus.online,
		  	});
			registered = false;
		} else {
			await this.usersService.setStatus(user.id, UserStatus.online);
			registered = true;
		}

		return {user, registered};
	}

	/* 
	* Updates the existing AuthToken
	* or creates a new one 
	* for the user with this userId
	*/
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

	async logout(res: Response, user: User) {
		res.clearCookie('jwt-token', { httpOnly: true });
		res.clearCookie('refresh-token', { httpOnly: true });
		this.usersService.setStatus(user.id, UserStatus.offline);
	}

	async refreshJwt(user) {
		const payload = { sub: user.sub, username: user.username };
		const token = await this.jwtService.signAsync(payload);
		
		await this.updateAuthToken(user.sub, token);

		await this.usersService.setStatus(user.sub, UserStatus.online);
		
		return token;
	}

	async allClients() {
		return await this.prisma.user.findMany();
	}

	async allTokens() {
		return await this.prisma.authToken.findMany();
	}
}