import type { Logger, LoggerOptions } from 'winston'
import {
  format,
  transports,
  createLogger as winstonCreateLogger,
} from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const { combine, timestamp, label, printf } = format

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

export function createLogger(labelName = 'DefaultLabel'): Logger {
  const options: LoggerOptions = {
    level: 'info',
    format: combine(label({ label: labelName }), timestamp(), customFormat),
    transports: [
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      }),
      new transports.Console({
        format: combine(
          format.colorize(),
          label({ label: labelName }),
          timestamp(),
          customFormat,
        ),
      }),
    ],
  }

  return winstonCreateLogger(options)
}
