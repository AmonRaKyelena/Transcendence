import { Module } from '@nestjs/common';
import { LobbyService } from './services/lobby.service';
import { CommonModule } from '../common/common.module';
import {GameGateway} from "./game.gateway";
import { PrismaService } from 'src/prisma/prisma.servise';
import { ChatModule } from 'src/chat/chat.module';
import { HistoryService } from "../users/services/history.service";

@Module({
  providers: [LobbyService, GameGateway, PrismaService, HistoryService], // добавили сервис истории
  imports: [CommonModule, ChatModule],
  exports: [LobbyService]
})

export class GameModule {}
