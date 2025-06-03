import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { userProvider } from './user.providers';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, ...userProvider],
})
export class UserModule {}
