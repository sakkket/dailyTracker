import { Module } from '@nestjs/common';
import { UservisitService } from './uservisit.service';
import { UservisitController } from './uservisit.controller';
import { UserVisitProvider } from './uservisit.provider';
import { DatabaseModule } from '../database/database.module';
@Module({
  controllers: [UservisitController],
  providers: [UservisitService, ...UserVisitProvider],
  imports: [DatabaseModule],
})
export class UservisitModule {}
