import { Document } from 'mongoose';

export interface UserVisit extends Document {
  readonly count: number;
  readonly lastVisit: Date;
  readonly userId: string;
}
