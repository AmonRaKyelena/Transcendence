import { Socket } from 'socket.io';
import { Message } from '@prisma/client';

export class ChatLobby {
	public name: string;
	public clients = new Map<string, Socket>([]);

	constructor(private chatName: string) {
		this.name = chatName;
	}

	addUser(username: string, socket: Socket) {
		if (this.clients.has(username))
			console.log('Error: this user already connected');
		else {
			this.clients.set(username, socket);
		}
	}

	deleteUser(socket: Socket) {
		for (let [key, value] of this.clients.entries()) {
			if (value === socket) {
				this.clients.delete(key);
				break;
			}
		}
	}

	async broadcast(message: Message, notListening = new Set<string>()) {
		for (let [key, value] of this.clients.entries()) {
			if (!notListening.has(key)) {
				value.emit('message', message);
			}
		}
	}
}