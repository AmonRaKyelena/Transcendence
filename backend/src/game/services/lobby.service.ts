import { Injectable } from '@nestjs/common';
import { Lobby } from "../gameLobby";
import { Socket } from 'socket.io';
import { HistoryService } from "../../users/services/history.service";
import {HistoryDto} from "../../users/dtos/history.dto";

const PADDLE_WIDTH = 8;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 20;
const UPDATE_INTERVAL = 8;


@Injectable()
export class LobbyService {
	private lobbies: Map<string, Lobby> = new Map();
	constructor(private historyService: HistoryService) {} // добавили сервис истории

	createLobby(lobbyId: string, ownerId: string, modeGame: string): Lobby {
		const lobby = new Lobby(lobbyId, ownerId);
		lobby.setModeGame(modeGame);
		this.lobbies.set(lobbyId, lobby);
		return lobby;
	}

	getLobby(lobbyId: string): Lobby | undefined {
		return this.lobbies.get(lobbyId);
	}

	getAllLobbies(): Lobby[] {
		return Array.from(this.lobbies.values());
	}

	removeLobby(lobbyId: string) {
		this.lobbies.delete(lobbyId);
	}

	async startGame(client: Socket, lobby: Lobby) {
		// const players = lobby.getPlayers();
		// const socketsClients = lobby.getSockets();
		if (!lobby) {
			throw new Error("Lobby not found.");
		}

		const players = lobby.getPlayers();
    	const sockets = lobby.getSockets();
		let modeGame;

		if(lobby.getModeGame() === "default")
			modeGame = 5;
		else
			modeGame = 10;

		if (!sockets || sockets.length < 2) {
			throw new Error("Not enough players.");
		}

		const gameState: GameState = {
			ball: {
			x: 430, 
			y: 255, 
			speedX: 5, 
			speedY: 5,
			},
			paddles: {},
		};

		 players.forEach((playerId, index) => {
      		gameState.paddles[playerId] = {
				y: 275,
				x: index === 0 ? 0 : 892, 
				score: 0
			};
		});

		sockets.forEach(socket => socket.emit("startGame", players));
		
		sockets.forEach(socket => {
			socket.on("newPositionUp", (userId) => {
			  const paddle = gameState.paddles[userId];
			  if (paddle) {
				paddle.y = Math.max(paddle.y - 12, 0);
			  }
			});

			socket.on("newPositionDown", (userId) => {
				const paddle = gameState.paddles[userId];
				if (paddle) {
				  paddle.y = Math.min(paddle.y + 12, 550 - PADDLE_HEIGHT);
				}
			  });
			});

		const gameLoop = () => {

			gameState.ball.x += gameState.ball.speedX;
			gameState.ball.y += gameState.ball.speedY;

			if (gameState.ball.y <= 0 || gameState.ball.y + BALL_RADIUS >= 550) {
				gameState.ball.speedY = -gameState.ball.speedY;
			  }
			
			Object.entries(gameState.paddles).forEach(([playerId, paddle]) => {
				if (
					gameState.ball.x + BALL_RADIUS >= paddle.x &&
					gameState.ball.x <= paddle.x + PADDLE_WIDTH &&
					gameState.ball.y >= paddle.y &&
					gameState.ball.y <= paddle.y + PADDLE_HEIGHT 
				) {
					gameState.ball.speedX = -gameState.ball.speedX;
					const speedIncrease = 0.1;
					gameState.ball.speedX *= (1 + speedIncrease);
					gameState.ball.speedY *= (1 + speedIncrease);
		
					const hitSpot = gameState.ball.y - (paddle.y + PADDLE_HEIGHT / 2);
					gameState.ball.speedY += hitSpot * 0.1;
				}

			});
			
			if (gameState.ball.x <= 0 || gameState.ball.x + BALL_RADIUS >= 900) {
				const scoringPlayer = gameState.ball.x <= 0 ? 1 : 0; 
				gameState.paddles[players[scoringPlayer]].score++;
			
				// Сброс положения мяча
				gameState.ball.x = 430;
				gameState.ball.y = 255;
				gameState.ball.speedX = 5;
				gameState.ball.speedY = (Math.random() > 0.5 ? 1 : -1) * 5; 
			
				// Проверка на победу
				if (gameState.paddles[players[scoringPlayer]].score === modeGame) {

					// сохранение результата в историю
					const loosingPlayer = scoringPlayer === 0 ? 1 : 0;
					this.historyService.addHistory(new HistoryDto(
						players[scoringPlayer], // юзернейм победителя
						players[loosingPlayer], // юзернейм проигравшего
						gameState.paddles[players[scoringPlayer]].score, // очки победителя
						gameState.paddles[players[loosingPlayer]].score)); // очки проигравшего
				  sockets.forEach(socket => socket.emit("gameOver", { winner: players[scoringPlayer] }));
					lobby.deleteSocket(sockets[0]);
					lobby.deleteSocket(sockets[1]);
					lobby.leaveLobby(this);
					
				  clearInterval(gameLoopInterval);
				  
				}
			  }

			sockets.forEach(socket => {
					socket.emit('positions', JSON.stringify(gameState));
			  	});
			};
			
		
			const gameLoopInterval = setInterval(gameLoop, 1000 / 60);
					
	}
}

interface GameState {
	ball: {
		x: number;
		y: number;
		speedX: number;
		speedY: number;
	};
	paddles: {
		[playerId: string]: {
			y: number;
			x: number;
			score: number;
		};
	};
}