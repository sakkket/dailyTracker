import { Connection } from 'mongoose';
import { TransactionSchema } from '../schemas/Transaction.schema';

export const TransactionProvider = [
  {
    provide: 'TRANSACTION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Transaction', TransactionSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
