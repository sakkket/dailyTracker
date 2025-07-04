import { Controller, Get, UseGuards, Request, Post, Body } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { ReviewDto } from 'src/dto/create-review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getReviews() {
    return this.reviewService.getReview();
  }

  @UseGuards(JwtAuthGuard)
  @Get('exists')
  getUserReviews(@Request() req) {
    const user = req.user;
    return this.reviewService.checkReviewExits(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createReview(@Request() req, @Body() reviewDto: ReviewDto) {
    const user = req.user;
    return this.reviewService.createReview(reviewDto, user);
  }
}
