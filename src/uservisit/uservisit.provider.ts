import { Connection } from 'mongoose';
import { UserVisitSchema } from 'src/schemas/uservisits.schema';

export const UserVisitProvider = [
  {
    provide: 'USER_VISIT_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('UserVisit', UserVisitSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
