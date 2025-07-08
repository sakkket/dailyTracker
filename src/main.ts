import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { logger } from './logger';

import * as morgan from 'morgan';
import * as rfs from 'rotating-file-stream';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDir,
    maxSize: '10M',
    compress: 'gzip',
  });

  app.use(morgan('combined', { stream: accessLogStream }));
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties that don't have decorators
      forbidNonWhitelisted: true, // throws if unknown properties exist
      transform: true, // auto-transforms payloads to DTO instances
    }),
  );
  logger.info('Application bootstrapping...');
  await app.listen(3010, '0.0.0.0');
  logger.info(`Server running on http://localhost:3010`);
}
bootstrap();
