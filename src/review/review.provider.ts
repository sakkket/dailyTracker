import { Connection } from 'mongoose';
import { ReviewSchema } from 'src/schemas/Review.schema';

export const ReviewProvider = [
  {
    provide: 'REVIEW_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Review', ReviewSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
