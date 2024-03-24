import { LobbyService } from "./services/lobby.service";
import { Socket } from 'socket.io';

export class Lobby {
    private players: [string, string] = ['', ''];
    private modeGame: string = '';
    private sockets: Set<Socket> = new Set();

    constructor(private lobbyId: string, private ownerId: string) {
        console.log(`Lobby created by owner: ${ownerId}`);
        this.players[0] = ownerId;
    }

    joinLobby(userId: string) {
        if (this.players.includes(userId)) {
            console.error(`User ${userId} is already in the lobby`);
            return;
        }

        if (userId !== this.ownerId && this.players[1] === '') {
            this.players[1] = userId;
        }
    }

    deleteSocket(socket: Socket) { 
        this.sockets.delete(socket);
    }

    addSocket(socket: Socket) {
        this.sockets.add(socket);
    }

    getSockets(): Socket[] {
        return Array.from(this.sockets.values());
    }

    setModeGame(modeGame: string){
        this.modeGame = modeGame;
    }

    getModeGame(): string {
        return this.modeGame;
    }

    getPlayers(): [string, string] {
        return this.players;
    }

    leaveLobby(lobbyService: LobbyService) {
        lobbyService.removeLobby(this.lobbyId);
    }
}