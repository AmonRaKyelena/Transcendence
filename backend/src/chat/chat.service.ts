import {BadRequestException, Injectable} from '@nestjs/common';
import {UsersService} from 'src/users/services/users.service';
import {PrismaService} from 'src/prisma/prisma.servise';
import {ChatDto} from './chat.dto';
import {Chat,} from '@prisma/client'
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
	constructor(
		private prisma: PrismaService,
		private users: UsersService
	) {
	}

	async findChat(chatName: string): Promise<boolean> {
		return !!(await this.prisma.chat.findUnique({where: {name: chatName}}))
	}

	async createChat(newChat: ChatDto, creatorId: string): Promise<Chat> {
		if (newChat.private == true)
			var hashedPassword = await bcrypt.hash(newChat.password, 10)

		const createdChat = await this.prisma.chat.create({
			data: {
				name: newChat.name,
				private: newChat.private,
				password: newChat.private ? hashedPassword : newChat.password,
				ownerid: newChat.owner,
				group: newChat.group
			}
		})
		if (newChat.group == true) {
			await this.joinChat(createdChat.id, creatorId, newChat.password)
			await this.setUserAdmin(createdChat.id, creatorId, true)
		}
		return (createdChat)
	}

	async setPassword(chatId: number, password: string) {
		let privateChat = false;
		let hashedPassword = '';
		if (password != '') {
			hashedPassword = await bcrypt.hash(password, 10);
			privateChat = true;
		}
		await this.prisma.chat.update({
			where: {id: chatId},
			data: {
				private: privateChat,
				password: hashedPassword
			}
		})
	}

	async getPassword(chatId: number) {
		return (await this.prisma.chat.findUnique({
			where: {id: chatId},
			select: {password: true}
		}))
	}

	async joinChat(chatId: number, userId: string, password: string) {
		if (await this.prisma.chatToken.findFirst({where: {userid: userId, chatid: chatId}}))
			throw new BadRequestException("User already in chat");

		if ((await this.isPrivate(chatId)).private) {
			const chatPass = (await this.getPassword(chatId)).password;
			if (await bcrypt.compare(password, chatPass)) {
				await this.createChatToken(chatId, userId)
			} else {
				return false;
			}
		} else {
			await this.createChatToken(chatId, userId)
		}

		return true;
	}

	async leaveChat(chatId: number, userId: string) {
		await this.deleteChatToken(chatId, userId)
	}

	async isPrivate(chatId: number) {
		return (await this.prisma.chat.findFirst({
			where: {id: chatId},
			select: {private: true}
		}))
	}

	async createChatToken(
		chatId: number,
		userId: string,
		isAdmin: boolean = false,
		isMute: boolean = false) {
		const newToken = await this.prisma.chatToken.create({
			data: {
				chatid: chatId,
				userid: userId,
				admin: isAdmin,
				muted: isMute,
				inchat: true,
			}
		})
	}

	async deleteChatToken(chatId: number, userId: string) {
		await this.prisma.chatToken.delete({
			where: {chatid_userid: {userid: userId, chatid: chatId}}
		})
	}

	async createMessage(chatId: number, userId: string, line: string) {
		return await this.prisma.message.create({
			data: {
				body: line,
				chatid: chatId,
				userid: userId
			}
		})
	}

	async getChatMessages(chatId: number, userId: string) {
		var blocked_list = await this.prisma.friendship.findMany({
			where: {userId: userId, blocked: true},
			select: {friendID: true}
		})
		const blockedUserIds = blocked_list.map(blocked => blocked.friendID);
		return await this.prisma.message.findMany({
			where: {
				chatid: chatId,
				userid: {notIn: blockedUserIds},
			},
			orderBy: {createdAt: 'asc'},
			select: {
				body: true,
				createdAt: true,
				fromUser: {select: {username: true}},
			}
		})
	}

	async getUserChatsName(username: string): Promise<{ name: string }[] | { name: string }> {
		const userId: string = (await this.users.findOneByName(username)).id;

		var chats = await this.prisma.chatToken.findMany({
			where: {
				userid: userId,
				inchat: true
			},
			select: {
				chat: {select: {name: true}}
			}
		})
		return (chats.map((item) => item.chat))
	}

	async getUserJoinableChats(userId: string) {
		var chats = await this.prisma.chat.findMany({
			where: {
				NOT: {members: {some: {userid: userId, inchat: true}}},
				group: true,
			},
			select: {
				name: true, group: true, private: true
			}
		})
		return chats
	}

	async isUserInChat(chatId: number, userId: string): Promise<boolean> {
		return !!(await this.prisma.chatToken.findFirst({
			where: {chatid: chatId, userid: userId},
			select: {inchat: true}
		}))
	}

	async getChatUsers(chatId: number) {
		return await this.prisma.chatToken.findMany({
			where: {chatid: chatId},
			select: {
				user: {select: {id: true, username: true, profilePic: true, status: true}},
				admin: true,
				muted: true,
				chat: {select: {ownerid: true}}
			}
		}).then((chatTokens: any) => {
			return chatTokens.map((chatToken: any) => ({
				user: chatToken.user,
				admin: chatToken.admin,
				muted: chatToken.muted,
				owner: chatToken.chat.ownerid === chatToken.user.username
			}));
		});
	}

	async isAdmin(chatId: number, userId: string): Promise<boolean> {
		const key = await this.prisma.chatToken.findFirst({
			where: {
				userid: userId,
				chatid: chatId,
			},
			select: {
				admin: true,
			}
		})
		if (!key)
			return false;
		return (key.admin)
	}

	async isOwner(chatId: number, userId: string): Promise<boolean> {
		const key = await this.prisma.chat.findFirst({
			where: {
				id: chatId,
				ownerid: userId,
			}
		})
		return (key != null)
	}

	async isMuted(chatId: number, userId: string): Promise<boolean> {
		const key = await this.prisma.chatToken.findFirst({
			where: {
				userid: userId,
				chatid: chatId,
			},
			select: {
				muted: true,
			}
		})
		return (key.muted)
	}

	async kickUser(chatId: number, userId: string) {
		await this.leaveChat(chatId, userId)
		return "User kicked"
	}

	async setUserAdmin(chatId: number, userId: string, key: boolean) {
		const old = this.prisma.chatToken.findFirst({
			where: {
				userid: userId,
				chatid: chatId,
			},
			select: { admin: true ,user: true }
		})
		if ((await old).admin != key) {
			var res = await this.prisma.chatToken.update({
				where: {
					chatid_userid: { userid: userId, chatid: chatId }
				},
				data: {
					admin: key
				}
			})
		}
		if (key == true) {
			await this.setUserMute(chatId, userId, false);
		}
		return "User was " + (key == true ? "set as admin" : "deleted from admins");
	}

	async setUserMute(chatId: number, userId: string, key: boolean) {
		const old = this.prisma.chatToken.findFirst({
			where: {
				userid: userId,
				chatid: chatId,
			},
			select: { muted: true }
		})
		if ((await old).muted != key) {
			const res = await this.prisma.chatToken.update({
				where: {
					chatid_userid: {userid: userId, chatid: chatId}
				},
				data: {
					muted: key
				}
			});
		}
		return "User was " + (key == true ? "mutted" : "unmutted")
	}

	async getSafeChatId(chatName: string): Promise<number> {
		let result: number;
		try {
			result = (await this.prisma.chat.findUniqueOrThrow({
			where: {name: chatName},
			select: {id: true}
			})).id
		} catch (e) {
			throw (e)
		}
		return result
	}

	async getSafeUserId(userName: string): Promise<string> {
		let result: string;
		try {
			result = (await this.prisma.user.findUniqueOrThrow({
				where: {username: userName},
				select: {id: true}
			})).id
		} catch (e) {
			throw (e)
		}
		return result
	}
}