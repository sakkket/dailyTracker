// src/auth/jwt.strategy.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/interfaces/user.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWTSECRET') || '',
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.userModel.findOne({ email: payload.email });
      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
