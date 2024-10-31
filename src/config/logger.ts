import { createLogger, format, transports } from 'winston';

const log = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/webapp.log' })
  ],
});

export default log;
