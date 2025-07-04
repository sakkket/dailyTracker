import { Inject, Injectable } from '@nestjs/common';
import { create } from 'domain';
import { Model } from 'mongoose';
import { Review } from 'src/interfaces/review.interface';
import { ReviewDto } from 'src/dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @Inject('REVIEW_MODEL')
    private reviewModel: Model<Review>,
  ) {}

  async getReview() {
    const reviews = await this.reviewModel
      .find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name');
    const response: any = [];
    for (const review of reviews) {
      response.push({
        id: review['_id'],
        name: review['userId']['name'],
        rating: review['rating'],
        review: review['review'],
      });
    }
    return response;
  }

  async createReview(reviewDto: ReviewDto, user: any) {
    const userId = (user._id || '').toString();
    return await this.reviewModel.create({
      userId: userId,
      ...reviewDto,
    });
  }

  async checkReviewExits(user: any): Promise<boolean> {
    const userId = (user._id || '').toString();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const review = await this.reviewModel.find({
      userId: userId,
      createdAt: { $gte: oneWeekAgo },
    });
    if (review && review.length) {
      return true;
    }
    return false;
  }
}
