import * as mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (
      configService: ConfigService,
    ): Promise<typeof mongoose> => {
      const dbUri = configService.get<string>('MONGODBCONNECTION') || '';
      return mongoose.connect(dbUri);
    },
    inject: [ConfigService],
  },
];
