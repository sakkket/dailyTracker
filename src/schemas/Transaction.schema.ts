import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema'; // adjust the path as needed

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  amount: number;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: true })
  isValid: boolean;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop()
  year: string; // e.g. "2025"

  @Prop()
  month: string; // e.g. "2025-05"

  @Prop()
  day: string; // e.g. "2025-05-18"

  @Prop()
  comment: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
