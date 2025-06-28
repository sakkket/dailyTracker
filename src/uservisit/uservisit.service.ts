import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserVisit } from 'src/interfaces/uservisit.interface';

@Injectable()
export class UservisitService {
  constructor(
    @Inject('USER_VISIT_MODEL')
    private userVisitModel: Model<UserVisit>,
  ) {}
  private inProgress = new Set();
  async getUserVisit(user: any = {}) {
    const userId = user.id;
    if (this.inProgress.has(userId)) {
      return 'Already Processing';
    }
    try {
      this.inProgress.add(userId);
      const checkIfUserExists = await this.userVisitModel.findOne({
        userId: userId,
      });
      if (checkIfUserExists) {
        const id = checkIfUserExists.id;
        await this.userVisitModel.findByIdAndUpdate(id, {
          $set: { lastVisit: new Date(), count: checkIfUserExists.count + 1 },
        });
      } else {
        await this.userVisitModel.create({
          userId: userId,
          lastVisit: new Date(),
          count: 1,
        });
      }
      const count = await this.userVisitModel.countDocuments();
      return { count: count };
    } finally {
      this.inProgress.delete(userId);
    }
  }
}
