import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.servise';
import { UserDto } from '../dtos/user.dto';
import { User } from '@prisma/client';
import * as speakeasy from 'speakeasy'
import { stat } from 'fs';

export enum UserStatus {
	online = 'online',
	offline = 'offline',
	inGame = 'game'
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {
    }

	async findOne(id: string): Promise<User | null> {
		if (!id || id.length == 0)
			throw new Error('Can find user with empty id!');
		return await this.prisma.user.findUnique({
			where: { id: id },
		});
	}

	async findOneBy42Id(id: string): Promise<User | null> {
		return await this.prisma.user.findFirst({
			where: { fortytwo_id: id },
		});
	}

	async findOneByName(username: string): Promise<User | null> {
		return await this.prisma.user.findFirst({
			where: { username: username },
		});
	}

	async createUser(userDto: UserDto): Promise<User> {
		const secret = speakeasy.generateSecret({ length: 20 });
        const rank = await this.prisma.user.count() + 1;
		const new_user = await this.prisma.user.create({
			data: {
				username: userDto.username,
				first_name: userDto.first_name,
				last_name: userDto.last_name,
				fortytwo_id: userDto.fortytwo_id.toString(),
                ranking: rank,
				status: userDto.status,
				profilePic: userDto.profilePic,
				googleSecret: secret.ascii,
			},
		});

		return new_user;
	}

	async setStatus(userID: string, status: UserStatus) {
		const user: User | null = await this.findOne(userID);
		if (!user)
			return ;
		if (user.status != status) {
			user.status = status;
			await this.prisma.user.update({
				where: { id: user.id },
				data: user,
			});
		}
	}

	async updateProfilePic(filename: string, user: User) {
		if (user.profilePic == filename)
			return ;
		user.profilePic = filename;
		await this.prisma.user.update({
			where: { id: user.id },
			data: user,
		});
	}

	async disable2FA(user: User) {
		if (user.twoFAEnabled) {
			user.twoFAEnabled = false;
			await this.prisma.user.update({
				where: { id: user.id },
				data: user,
			});
		}
	}

	async enable2FA(user: User) {
		if (!user.twoFAEnabled) {
			user.twoFAEnabled = true;
			await this.prisma.user.update({
				where: { id: user.id },
				data: user,
			});
		}
	}

    async is2FAEnabled(user: User) {
        const  res  = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: {twoFAEnabled: true},
        });
        if (!res)
            return false;
        return (res.twoFAEnabled);
    }

	async saveGoogleSecret(user: User, secret: any) {
		if (!user.googleSecret) {
			user.googleSecret = secret.ascii;
			await this.prisma.user.update({
				where: { id: user.id },
				data: user,
			});
		}
	}

	async changeNick(user: User, newNick: string) {
		const exist: User | null = await this.findOneByName(newNick);
		if (exist && exist.id !== user.id)
			throw new Error('User already exists!');
        let oldNick = user.username;
		user.username = newNick;
		await this.prisma.user.update({
			where: { id: user.id },
			data: user,
		});
        let dmChats = await this.prisma.chat.findMany({
            where: {
                OR: [
                    { name: { contains: oldNick + '-' } },
                    { name: { contains: '-' + oldNick } }
                ]
            }
        });
        for (const chat of dmChats) {
            let chatNameParts = chat.name.split('-');
            let userNames = chatNameParts.filter(name => name !== oldNick && name !== newNick);
            userNames.push(newNick);
            userNames.sort();
            let updatedName = userNames.join('-');

            await this.prisma.chat.update({
                where: { id: chat.id },
                data: { name: updatedName },
            });
        }
        let ownedChats = await this.prisma.chat.findMany({
            where: { ownerid: user.username }
        });
        for (const chat of ownedChats) {
            await this.prisma.chat.update({
                where: { id: chat.id },
                data: { ownerid: newNick },
            });
        }
	}

	async leaderboard() {
		const topUsers = await this.prisma.user.findMany({
			take: 10,
			orderBy: {
			  ranking: 'asc',
			},
			select: {
			  username: true,
			  profilePic: true,
			  ranking: true,
			  wins: true,
			  looses: true,
			},
		});

		return topUsers;
	}

    async friendList(user: User) {
        const friendships = await this.prisma.friendship.findMany({
            where: {blocked : false, userId: user.id},
            select: {friendID: true},
        });

        const friendIDs = friendships.map((friendship) => friendship.friendID);

        const friendsData = await this.prisma.user.findMany({
            where: {
                id: {in: friendIDs},
            },
        });

        return friendsData;
    }

    async isFriend(username: string, user: User) {
        const friend: User = await this.findOneByName(username);
        if (!friend)
            return ({error: 'No such user!'});

        const exists = await this.prisma.friendship.findMany({
            where: {
                blocked: false,
                userId: user.id,
                friendID: friend.id,
            }
        })

        return exists.length > 0;
    }

    async addFriend(user: User, friendNick: string) {
        const friend: User = await this.findOneByName(friendNick);
        if (!friend)
            return ({error: 'No such user!'});

        const friendToUser = await this.prisma.friendship.findFirst({
            where: {
                userId: friend.id,
                friendID: user.id,
            }
        })
        if (friendToUser && friendToUser.blocked) {
            return ({error: friendNick + ' blocked you'});
        }

        const userToFriend = await this.prisma.friendship.findFirst({
            where: {
                userId: user.id,
                friendID: friend.id,
            }
        })

        if (userToFriend && userToFriend.blocked) {
            return ({success: 'Unblock ' + friendNick + ' to add him as friend'});
        }

        if (userToFriend && friendToUser)
            return ({success: friendNick + ' already added to friends'});

        const relation = await this.prisma.friendship.create({
            data: {
                blocked: false,
                userId: user.id,
                friendID: friend.id,
            }
        })

        const friendRelation = await this.prisma.friendship.create({
            data: {
                blocked: false,
                userId: friend.id,
                friendID: user.id,
            }
        })

        if (!relation || !friendRelation)
            return ({error: 'Error while adding friend'});

        let chatName = [user.username, friend.username].sort().join('-');

        let chat = await this.prisma.chat.findUnique({
            where: {name: chatName},
        });

        if (!chat) {
            chat = await this.prisma.chat.create({
                data: {
                    name: chatName,
                    private: false,
                    password: null,
                    ownerid: user.id,
                    group: false
                }
            });
        }
        let chatToken = await this.prisma.chatToken.findFirst({
            where: {chatid: chat.id},
        });
        if (!chatToken) {
            await this.prisma.chatToken.createMany({
                data: [
                    {
                        chatid: chat.id,
                        userid: user.id,
                        admin: false,
                        muted: false,
                        inchat: true,
                    },
                    {
                        chatid: chat.id,
                        userid: friend.id,
                        admin: false,
                        muted: false,
                        inchat: true,
                    }
                ]
            });
        }

        return ({success: friendNick + ' added to friends'});
    }

    async blockUser(user: User, userToBlock: string) {
        const blockedUser = await this.findOneByName(userToBlock);
        if (!blockedUser)
            return ({error: 'No such user'});

        const alreadyBlocked = await this.prisma.friendship.findFirst({
            where: {
                blocked: true,
                userId: user.id,
                friendID: blockedUser.id,
            }
        });

        if (alreadyBlocked)
            return ({error: userToBlock + ' already blocked'});

        await this.deleteFriend(user, userToBlock);

        await this.prisma.friendship.create({
            data: {
                userId: user.id,
                friendID: blockedUser.id,
                blocked: true,
            }
        });

        return ({success: userToBlock + ' blocked'});
    }

    async unblockUser(user: User, friendNick: string) {
        const friend: User = await this.findOneByName(friendNick);
        if (!friend)
            return ({error: 'No such user!'});

        const friendship = await this.prisma.friendship.findFirst({
            where: {
                userId: user.id,
                friendID: friend.id,
                blocked: true,
            }
        })

        if (!friendship) {
            return ({error: friendNick + ' not blocked'});
        } else {
            await this.prisma.friendship.deleteMany({
                where: {
                    userId: user.id,
                    friendID: friend.id,
                    blocked: true,
                }
            });
        }
        return ({success: friendNick + ' unblocked'});
    }

    async deleteFriend(user: User, friendNick: string) {
        const friend = await this.findOneByName(friendNick);
        if (!friend)
            return ({error: 'No such user'});

        const friendship = await this.prisma.friendship.findFirst({
            where: {
                blocked: false,
                userId: user.id,
                friendID: friend.id,
            }
        })

        if (!friendship)
            return ({error: 'You are not friends'});

        const friendship2 = await this.prisma.friendship.findFirst({
            where: {
                blocked: false,
                userId: friend.id,
                friendID: user.id,
            }
        })

        await this.prisma.friendship.deleteMany({
            where: {
                OR: [
                    {id: friendship.id},
                    {id: friendship2.id},
                ],
            },
        });
        let chat = await this.prisma.chat.findFirst({
            where: {
                name: [user.username, friend.username].sort().join('-'),
            }
        });
        if (chat)
            await this.prisma.chatToken.deleteMany({
                where: {
                    chatid: chat.id
                }
            });
        return ({success: 'Friend deleted'});
    }

    async isBlocked(user: User, friendNick: string) {
        const friend = await this.findOneByName(friendNick);
        if (!friend)
            return ({error: 'No such user'});

        const friendship = await this.prisma.friendship.findFirst({
            where: {
                blocked: true,
                userId: user.id,
                friendID: friend.id,
            }
        })

        return {success: !!friendship};
    }
}