import { Document } from 'mongoose';

export interface User extends Document {
  readonly name: string;
  readonly phone: number;
  readonly email: string;
  readonly password: string;
  readonly gender: string;
  readonly currencyCode: string;
  readonly country: any;
}
