import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { PrismaService } from 'src/prisma/prisma.servise';
import { UsersController } from './controllers/users.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [
	UsersService,
	PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
