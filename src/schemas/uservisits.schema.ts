import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema'; // adjust the path as needed

@Schema({ timestamps: true })
export class UserVisits {
  @Prop({ required: true })
  count: number;

  @Prop({ default: () => new Date() })
  lastVisit: Date;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;
}

export const UserVisitSchema = SchemaFactory.createForClass(UserVisits);
