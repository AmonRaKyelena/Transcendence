import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.servise';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [UsersModule],
  providers: [
	PrismaService,
	ChatService,
	ChatGateway],
  controllers: [ChatController],
  exports: [ChatService]
})
export class ChatModule {}
