import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from './jwtPayload';
import { UsersService } from './users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'nchrys',
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
