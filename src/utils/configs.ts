import path from 'path';
import fs from 'fs';

export const PORT = process.env.PORT || 80;
export const WORK_DIR = path.resolve(process.env.CLASSID ? process.env.CLASSID : 'default');

if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR);

const CONFIG_FILE = path.join(WORK_DIR, 'config.json');

if (!fs.existsSync(CONFIG_FILE)) {
	fs.copyFileSync(path.join('data', 'default-config.json'), CONFIG_FILE);
}

const config = JSON.parse(fs.readFileSync(CONFIG_FILE).toString());

export const LOGS_DIR = path.join(WORK_DIR, config.LOGS_DIR);
export const ACCOUNTS_FILE = path.join(WORK_DIR, config.ACCOUNTS_FILE);
export const PROBLEMS_DIR = path.join(WORK_DIR, config.PROBLEMS_DIR);
export const SUBMIT_DIR = path.join(WORK_DIR, config.SUBMIT_DIR);
export const ENABLE_SUBMIT_VIEW = config.ENABLE_SUBMIT_VIEW;
