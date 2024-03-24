import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.servise';
import { FortyTwoStrategy } from './strategies/42.strategy';
import { HttpModule, HttpService } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CheckOnlineService } from './services/cron.service';
import { PasswordStrategy } from './strategies/password.strategy';

@Module({
  imports: [
	forwardRef(() => UsersModule),
	PassportModule,
	HttpModule,
	JwtModule.register({
		secret: process.env.JWT_SECRET,
		signOptions: { expiresIn: '60s' },
	  }),
  ],
  providers: [
	AuthService,
	PrismaService,
	FortyTwoStrategy,
	JwtStrategy,
	CheckOnlineService,
	PasswordStrategy
  ],
  controllers: [AuthController],
  exports: [JwtStrategy],
})
export class AuthModule {}