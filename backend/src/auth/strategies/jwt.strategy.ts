import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies['jwt-token'],
      ]),
      secretOrKey: process.env.JWT_SECRET, 
    });
  }

  async validate(payload: any) {

    const userId = payload.sub;
	const username = payload.username;

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return user;
  }
}