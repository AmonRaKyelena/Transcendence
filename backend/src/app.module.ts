import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
		GameModule,
		AuthModule,
		ChatModule,
		UsersModule,
		ScheduleModule.forRoot(),
		CommonModule,
	],
})
export class AppModule {}
