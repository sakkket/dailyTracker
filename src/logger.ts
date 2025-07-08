// src/logger.ts
import { createLogger, format, transports } from 'winston';
import * as path from 'path';

const logDir = path.join(__dirname, '..', 'logs');

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }),
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, 'server.log'),
      maxsize: 5 * 1024 * 1024,
    }),
  ],
});
