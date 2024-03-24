import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.servise';
import { UserStatus } from 'src/users/services/users.service';

@Injectable()
export class CheckOnlineService {
	constructor(private prisma: PrismaService,
				private jwtService: JwtService) {}

	@Cron(CronExpression.EVERY_30_SECONDS)
	async handleCron() {
		const tokens = await this.prisma.authToken.findMany();

		for (const authToken of tokens) {
			try {
				const payload = await this.jwtService.verifyAsync(
					authToken.token, {
						secret: process.env.JWT_SECRET
					}
				);
			} catch {
				const user = await this.prisma.user.findUnique({ where: {id: authToken.userID} });
				if (user && user.status == UserStatus.online) {
					user.status = UserStatus.offline;
					await this.prisma.user.update({
						where: { id: user.id },
						data: user,
					});
				}
			}
		}
	}
}