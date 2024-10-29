import path from 'path';
import winston from 'winston';
import { LOGS_DIR } from './configs';

function getDateTimeString(nospace: boolean) {
	const str = new Date().toLocaleString('vi-VN');

	return nospace ? str.replace(' ', '_').replace(/\//g, '-').replace(/:/g, '-') : str;
}

const format = winston.format.printf(
	(info) => `[${getDateTimeString(false)} - ${info.level.toUpperCase()}] ${info.message}`
);

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: path.join(LOGS_DIR, `${getDateTimeString(true)}.log`),
		}),
	],
	format: winston.format.combine(format),
});

export default logger;
