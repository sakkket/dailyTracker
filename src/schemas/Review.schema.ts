import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema'; // adjust the path as needed

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  review: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
