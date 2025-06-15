import { Document, Types } from 'mongoose';

export interface Transaction extends Document {
  readonly amount: number;
  readonly date: string;
  readonly category: string;
  readonly type: string;
  readonly isValid: string;
  readonly userId: Types.ObjectId;
  readonly month: string;
  readonly year: string;
  readonly day: string;
  readonly comment: string;
}
