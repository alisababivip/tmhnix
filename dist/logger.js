"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const { combine, timestamp, label, printf } = winston_1.format;
const customFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
function createLogger(labelName = 'DefaultLabel') {
    const options = {
        level: 'info',
        format: combine(label({ label: labelName }), timestamp(), customFormat),
        transports: [
            new winston_daily_rotate_file_1.default({
                filename: 'logs/application-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '14d',
            }),
            new winston_1.transports.Console({
                format: combine(winston_1.format.colorize(), label({ label: labelName }), timestamp(), customFormat),
            }),
        ],
    };
    return (0, winston_1.createLogger)(options);
}
exports.createLogger = createLogger;
