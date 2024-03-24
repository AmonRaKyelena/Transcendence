import {OnGatewayConnection, ConnectedSocket,  SubscribeMessage, MessageBody,  WebSocketGateway, } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.servise';
import { Message } from '@prisma/client';
import { ChatLobby } from './ChatLobby';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayConnection
{
	constructor(
		private chatService: ChatService,
		private prisma: PrismaService
	){}
		
	private clients: Set<Socket> = new Set();
	private chats = new Map<string, ChatLobby>([])

	async handleConnection(socket: Socket): Promise<void> {
		this.clients.add(socket);

		socket.on('disconnect', () => {
			for (let [chatName, chat] of this.chats) {
				const chatSockets: Socket[] = Array.from(chat.clients.values());
				if (chatSockets.find((s) => s == socket)) {
					chat.deleteUser(socket);
					break;
				} 
			}
		});
	}
	@SubscribeMessage('join')
	async join(@MessageBody() body: {username: string, chatName: string},
			   @ConnectedSocket() socket: Socket) {
		let userChat: ChatLobby = null;
		for (let [chatName, chat] of this.chats) {
			if (chatName == body.chatName) {
				userChat = chat;
				break;
			} 
		}
		if (userChat == null) {
			userChat = new ChatLobby(body.chatName);
			this.chats.set(body.chatName, userChat);
		}

		userChat.addUser(body.username, socket);
	}

	@SubscribeMessage('message')
	async handleEvent (@MessageBody() message: {username: string, payload: string}, 
					  @ConnectedSocket() socket: Socket) {
		let userChat: ChatLobby;
		for (let [chatName, chat] of this.chats) {
			if (chat.clients.has(message.username)) {
				userChat = chat;
				break;
			} 
		}
		const user = await this.prisma.user.findUnique({ where: { username: message.username } });
		if (!user) throw new BadRequestException("User not found");

		console.log(`User ${user.username} tries to send a message "${message.payload}" to the chat ${userChat.name}`);

		const chatId = await this.chatService.getSafeChatId(userChat.name);
		if (!await this.chatService.isUserInChat(chatId, user.id)) {
			return;
		}

		if (await this.chatService.isMuted(chatId, user.id)) {
			return;
		}


		const msg: Message = await this.chatService.createMessage(chatId, user.id, message.payload);
		msg.userid = message.username;

		const blockerUsers = await this.prisma.friendship.findMany({
			where: { friendID: user.id, blocked: true },
			select: { user: { select: { username: true } } }
		});

		await userChat.broadcast(msg, new Set(blockerUsers.map(({user}) => user.username)));
	}

}
