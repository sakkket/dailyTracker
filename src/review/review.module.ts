import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewProvider } from './review.provider';
import { ReviewService } from './review.service';
import { DatabaseModule } from '../database/database.module';
@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ...ReviewProvider],
  imports: [DatabaseModule],
})
export class ReviewModule {}
