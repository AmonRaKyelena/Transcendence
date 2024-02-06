import { Controller, Get, Req } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/guards/auth-jwt.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// TODO
@Controller('user')
@UseGuards(JWTAuthGuard)
export class UsersController {
	constructor() {}

	@Get('userData')
	userData(@Req() req: Request) {
		const user: User = req['user'];

		return {
			username: user.username,
			first_name: user.first_name,
			last_name: user.last_name,
			status: user.status
		};
	}

	@Get('username')
	username(@Req() req: Request) {
		return {
			username: req['user'].username
		};
	}
}