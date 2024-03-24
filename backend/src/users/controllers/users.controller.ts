import { BadRequestException, Controller, Get, NotFoundException, Param, Post, Req, Res, UploadedFile, UseInterceptors, Headers } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { JWTAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilterCallback, diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsersService } from '../services/users.service';
import { existsSync } from 'fs';
import { HistoryService } from '../services/history.service';

@Controller('user')
export class UsersController {
	constructor(readonly usersService: UsersService, readonly historyService: HistoryService) {}

	@Get('userData')
	@UseGuards(JWTAuthGuard)
	userData(@Req() req: Request) {
		const user: User = req['user'];

		return {
			id: user.id,
			username: user.username,
			first_name: user.first_name,
			last_name: user.last_name,
			status: user.status,
			profilePic: user.profilePic,
			twoFAEnabled: user.twoFAEnabled,
			ranking: user.ranking,
			wins: user.wins,
			looses: user.looses,
		};
	}

	@Get('history')
	async getHistoryById(@Headers('id') id: string) {
		return this.historyService.getLastFourHistoriesByUserId(id);
	}

	@Get('friendsData')
	@UseGuards(JWTAuthGuard)
	async friendsData(@Headers('username') username: string,
		@Req() req: Request) {
		const user: User | null = await this.usersService.findOneByName(username);
		if (!user)
			return null;

		return {
			id: user.id,
			username: user.username,
			first_name: user.first_name,
			last_name: user.last_name,
			status: user.status,
			profilePic: user.profilePic,
			twoFAEnabled: user.twoFAEnabled,
			ranking: user.ranking,
			wins: user.wins,
			looses: user.looses,
		};
	}

	@Get('username')
	@UseGuards(JWTAuthGuard)
	username(@Req() req: Request) {
		return {
			username: req['user'].username
		};
	}

	@Post('upload')
	@UseGuards(JWTAuthGuard)
	@UseInterceptors(
		FileInterceptor('image', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, callback) => {
					const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
					return callback(null, `${randomName}${extname(file.originalname)}`);
				},
			}),
			fileFilter: (req, file, callback: FileFilterCallback) => {
				if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
					return callback(new BadRequestException("Only JPEG and PNG images are allowed."));
				}
				callback(null, true);
			},
		}),
	)
	async uploadFile(@UploadedFile() file: Express.Multer.File,
		@Req() req: Request) {
		const user: User = req['user']
		await this.usersService.updateProfilePic(file.filename, user);
		return { message: 'File uploaded!' };

	}

	@Get("profile-pictures/:imageName")
	async serveProfilePicture(@Param("imageName") imageName: string, @Res() res: Response) {
		let imagePath: string;
		if (imageName === 'default.jpg')
			imagePath = join("/app/BACK/resources", imageName);
		else
			imagePath = join("/app/BACK/uploads", imageName);

		if (!existsSync(imagePath)) {
			throw new NotFoundException("Profile picture not found.");
		}

		return res.status(200).sendFile(imagePath);
	}

	@Get('disable2FA')
	@UseGuards(JWTAuthGuard)
	async disable2FA(@Req() req: Request) {
		const user: User = req['user']
		await this.usersService.disable2FA(user);
	}

	@Get('enable2FA')
	@UseGuards(JWTAuthGuard)
	async enable2FA(@Req() req: Request) {
		const user: User = req['user']
		await this.usersService.enable2FA(user);
	}

	@Get('is2FAEnabled')
	@UseGuards(JWTAuthGuard)
	async is2FAEnabled(@Req() req: Request) {
		const user: User = req['user']
		return await this.usersService.is2FAEnabled(user);
	}

	@Post('changeNick')
	@UseGuards(JWTAuthGuard)
	async changeNick(@Req() req: Request, @Res() res: Response) {
		const user: User = req['user']
		try {
			await this.usersService.changeNick(user, req.body['newNick']);
			return res.status(200).json({ answer: 'success' });
		} catch (error) {
			return res.status(200).json({ answer: 'fail' });
		}
	}

	@Get('leaderboard')
	async leaderboard(@Req() req: Request) {
		return await this.usersService.leaderboard();
	}

	@Get('friendList')
	@UseGuards(JWTAuthGuard)
	async frinedList(@Req() req: Request) {
		return await this.usersService.friendList(req['user']);
	}

	@Get('isFriend/:username')
	@UseGuards(JWTAuthGuard)
	async isFriend(@Param('username') username: string,
					@Req() req: Request) {
		const user: User = req['user'];
		return await this.usersService.isFriend(username, user);
	}

	@Get('addFriend')
	@UseGuards(JWTAuthGuard)
	async addFriend(@Headers('friendNick') friendNick: string,
		@Req() req: Request) {
		if (friendNick == req['user'].username)
			return ({ error: 'You can`t add yourself' })
		return await this.usersService.addFriend(req['user'], friendNick);
	}

	@Get('blockUser')
	@UseGuards(JWTAuthGuard)
	async blockUser(@Headers('userToBlock') userToBlock: string,
		@Req() req: Request) {
		return await this.usersService.blockUser(req['user'], userToBlock);
	}

	@Get('unblockUser')
	@UseGuards(JWTAuthGuard)
	async unblockUser(@Headers('friendNick') friendNick: string,
		@Req() req: Request) {
			return await this.usersService.unblockUser(req['user'], friendNick);
	}

	@Get('deleteFriend')
	@UseGuards(JWTAuthGuard)
	async deleteFriend(@Headers('friendNick') friendNick: string,
		@Req() req: Request) {
		return await this.usersService.deleteFriend(req['user'], friendNick);
	}

	@Get('isBlocked')
	@UseGuards(JWTAuthGuard)
	async isBlocked(@Headers('friendNick') friendNick: string,
		@Req() req: Request) {
		return await this.usersService.isBlocked(req['user'], friendNick);
	}
}