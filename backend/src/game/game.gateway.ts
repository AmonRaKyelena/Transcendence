import { LobbyService } from './services/lobby.service';
import { Lobby } from "./gameLobby";
import { v4 as uuidv4 } from 'uuid';
import {
  OnGatewayConnection, ConnectedSocket,
  SubscribeMessage, MessageBody,
  WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import {Socket } from 'socket.io';

// Определение расширенного типа Socket для аутентифицированных пользователей
interface AuthenticatedSocket extends Socket { // Уникальный идентификатор подключения
	username: string; // Добавленное пользовательское свойство: имя пользователя
	data: {
	  lobby: Lobby | null; // Добавленное пользовательское свойство: данные лобби
	};
}
@WebSocketGateway()
export class GameGateway implements OnGatewayConnection {
  private clients: Set<AuthenticatedSocket> = new Set();

  constructor(private lobbyService: LobbyService) {}

  // Обработка подключения нового клиента
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    this.clients.add(client);
    console.log(`New client connected: ${client.id}`);

    client.on('disconnect', () => {
      const lobbies = this.lobbyService.getAllLobbies();
      for (const lobby of lobbies) {
        const players = lobby.getPlayers();
        if (players.includes(client.username)) {
          lobby.leaveLobby(this.lobbyService);
        }
      }
      
      this.clients.delete(client);
      console.log(`Client disconnected: ${client.id}`);
    });

    client.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  }

  // Создание нового лобби
  private createLobby(client: AuthenticatedSocket, userId: string, modeGame: string): void {
    const lobbyId = uuidv4();
    client.username = userId;
    const newLobby = this.lobbyService.createLobby(lobbyId, userId, modeGame);
    newLobby.addSocket(client);
  }

  // Присоединение к лобби
  @SubscribeMessage('joinLobby')
  joinLobby(@ConnectedSocket() client: AuthenticatedSocket,
            @MessageBody() message: {userId: string, modeGame: string }): void {
    const lobbies = this.lobbyService.getAllLobbies();
    let joined = false;
    console.log(`MODE: ${message.modeGame}`);
    for (const lobby of lobbies) {
      const players = lobby.getPlayers();
      console.log(`Plaers: ${players}`);
      if (players.includes(message.userId)) {
        // Пользователь уже в лобби
        return;
      }

      if (players[1] === '' && lobby.getModeGame() === message.modeGame) {
        // Присоединение к существующему лобби
        lobby.joinLobby(message.userId);
        lobby.addSocket(client);
        client.emit("enemyName", message.userId);
        this.lobbyService.startGame(client, lobby);
        joined = true;
        break;
      }
    }

    if (!joined) {
      // Создание нового лобби, если подходящего не найдено
      this.createLobby(client, message.userId, message.modeGame);
    }
  }
}