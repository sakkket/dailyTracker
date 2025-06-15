import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(user: any){
    const payload = { email: user.email, sub: user._id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '5d' });
    return accessToken;
  }

  generateRefreshToken(user: any) {
    const payload = { email: user?.email, sub: user?._id };
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return refreshToken;
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}
