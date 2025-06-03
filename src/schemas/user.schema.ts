// src/users/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: number;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
