import {Injectable} from '@nestjs/common';
import {PrismaService} from 'src/prisma/prisma.servise';
import {HistoryDto} from "../dtos/history.dto";

@Injectable()
export class HistoryService {

    constructor(private prisma: PrismaService) {
    }

    async getLastFourHistoriesByUserId(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        });
        if (!user) {
            return ('Invalid user id');
        }
        return await this.prisma.history.findMany({
            where: {
                userId: id
            },
            take: 4,
            orderBy: {
                finishedAt: 'desc'
            }
        });
    }

    async addHistory(historyDto: HistoryDto) {
        const winner = await this.prisma.user.findUnique({
            where: {
                username: historyDto.winnerUsername
            }
        });
        const looser = await this.prisma.user.findUnique({
            where: {
                username: historyDto.looserUsername
            }
        });
        if (!winner || !looser) {
            return ('Invalid winner or looser username');
        }

        const finishedAt = new Date();

        await this.prisma.history.create({
            data: {
                userId: winner.id,
                opponentUsername: looser.username,
                userScore: historyDto.winnerScore,
                opponentScore: historyDto.looserScore,
                finishedAt: finishedAt
            }
        });

        await this.prisma.user.update({
            where: {
                id: winner.id
            },
            data: {
                wins: {
                    increment: 1
                }
            }
        });

        await this.prisma.history.create({
            data: {
                userId: looser.id,
                opponentUsername: winner.username,
                userScore: historyDto.looserScore,
                opponentScore: historyDto.winnerScore,
                finishedAt: finishedAt
            }
        });

        await this.prisma.user.update({
            where: {
                id: looser.id
            },
            data: {
                looses: {
                    increment: 1
                }
            }
        });

        await this.updateRanks();

        return ('History added');
    }

    async updateRanks() {
        const players = await this.prisma.user.findMany({
            orderBy: [
                {
                    wins: 'desc'
                },
                {
                    looses: 'asc'
                }
            ]
        });
        let rank = 1;
        for (const player of players) {
            await this.prisma.user.update({
                where: {
                    id: player.id
                },
                data: {
                    ranking: rank++
                }
            });
        }
    }
}