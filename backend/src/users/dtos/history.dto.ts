export class HistoryDto {
    winnerUsername: string;
    looserUsername: string;
    winnerScore: number;
    looserScore: number;

    constructor(winnerUsername: string, looserUsername: string, winnerScore: number, looserScore: number) {
        this.winnerUsername = winnerUsername;
        this.looserUsername = looserUsername;
        this.winnerScore = winnerScore;
        this.looserScore = looserScore;
    }
}