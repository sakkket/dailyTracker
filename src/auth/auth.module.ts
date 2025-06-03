// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from 'src/database/database.module';
import { AuthProvider } from './auth.provider';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'authapp123',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, ...AuthProvider],
  exports: [AuthService],
})
export class AuthModule {}
