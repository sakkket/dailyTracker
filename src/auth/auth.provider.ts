import { Connection } from 'mongoose';
import { UserSchema } from '../schemas/user.schema';

export const AuthProvider = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
