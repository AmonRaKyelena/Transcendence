import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.servise';
import { UserDto } from '../dtos/user.dto';
import { User } from '@prisma/client';

export enum UserStatus {
	online = 'online',
	offline = 'offline',
}

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}	

	async findOne(id: string): Promise<User | null> {
		return await this.prisma.user.findUnique({
			where: { id: id },
		});
	}

	async findOneBy42Id(id: string): Promise<User | null> {
		return await this.prisma.user.findFirst({
			where: { fortytwo_id: id },
		});
	}

	async createUser(userDto: UserDto): Promise<User> {
		const new_user = await this.prisma.user.create({
			data: {
				username: userDto.username,
				first_name: userDto.first_name,
				last_name: userDto.last_name,
				fortytwo_id: userDto.fortytwo_id.toString(),
				status: userDto.status
			},
		});

		return new_user;
	}

	async setStatus(userID: string, status: UserStatus) {
		const user: User | null = await this.findOne(userID);
		if (!user)
			return ;
		user.status = status;
		await this.prisma.user.update({
			where: { id: user.id },
			data: user,
		});
	}
}