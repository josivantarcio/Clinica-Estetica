import winston from 'winston';
import config from '../config/external-services';

// Ensure logs directory exists
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = winston.createLogger({
  level: config.environment === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Adiciona informações extras em produção
if (config.environment === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/whatsapp.log',
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }));
}

export { logger }; 