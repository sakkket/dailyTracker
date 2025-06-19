import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserVisit } from 'src/interfaces/uservisit.interface';

@Injectable()
export class UservisitService {
  constructor(
    @Inject('USER_VISIT_MODEL')
    private userVisitModel: Model<UserVisit>,
  ) {}
  async getUserVisit(user: any = {}) {
    const checkIfUserExists = await this.userVisitModel.findOne({ userId: user.id });
    if (checkIfUserExists) {
      const id = checkIfUserExists.id;
      await this.userVisitModel.findByIdAndUpdate(id, {
        $set: { lastVisit: new Date(), count: checkIfUserExists.count + 1 },
      });
    } else {
      await this.userVisitModel.create({
        userId: user.id,
        lastVisit: new Date(),
        count: 1,
      });
    }
    const count = await this.userVisitModel.countDocuments();
    return { count: count };
  }
}
