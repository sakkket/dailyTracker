import { Document } from 'mongoose';

export interface Review extends Document {
  readonly rating: number;
  readonly review: string;
  readonly userId: string;
}
