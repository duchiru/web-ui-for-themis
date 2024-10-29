import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import { SUBMIT_DIR } from './configs';
import logger from './logging';

if (!fs.existsSync(SUBMIT_DIR)) fs.mkdirSync(SUBMIT_DIR);

const SUBMIT_LOGS_DIR = path.join(SUBMIT_DIR, 'Logs');

if (!fs.existsSync(SUBMIT_LOGS_DIR)) fs.mkdirSync(SUBMIT_LOGS_DIR);

interface SubmitData {
	judged: boolean;
	score: number;
}

interface ProcessedSubmitData {
	name: string;
	ext: string;
	score: number | string;
}

const db: Record<string, Record<string, Record<string, SubmitData>>> = {};
const submissionQueue = {
	set: new Set<string>(),
	queue: [] as string[],
};

export function createSubmit(fileName: string, content: string) {
	fs.writeFileSync(path.join(SUBMIT_DIR, fileName), content);

	const logFile = path.join(SUBMIT_LOGS_DIR, `${fileName}.log`);
	if (fs.existsSync(logFile)) fs.rmSync(logFile);

	if (!submissionQueue.set.has(fileName)) {
		submissionQueue.set.add(fileName);
		submissionQueue.queue.push(fileName);
	}
}

export function getOneSubmit() {
	const current = submissionQueue.queue.shift();
	if (current) submissionQueue.set.delete(current);
	return current;
}

export function createResult(fileName: string, content: string) {
	const stream = fs.createWriteStream(path.join(SUBMIT_LOGS_DIR, fileName), 'utf-8');
	stream.write('\ufeff'); // UTF-8 with BOM
	stream.write(content);
	stream.end();
}

export async function getSubmits(user: string) {
	const submits: ProcessedSubmitData[] = [];
	const userSubmits = db[user];

	if (userSubmits) {
		Object.keys(userSubmits).forEach((problem) => {
			Object.keys(userSubmits[problem]).forEach((ext) => {
				const data = userSubmits[problem][ext];

				submits.push({
					name: problem,
					ext,
					score: data.judged ? data.score : 'Chưa chấm',
				});
			});
		});
	}

	return submits;
}

export function getSubmitResultContent(submitName: string) {
	const filePath = path.join(SUBMIT_LOGS_DIR, submitName);
	return fs.readFileSync(filePath).toString('utf-8');
}

export function getAllSubmits() {
	return Object.assign({}, db);
}

async function loadSubmitFile(file: string): Promise<void> {
	logger.info(`Loading submit data from ${file}`);

	try {
		const statusText = await getSubmitLogOverview(path.join(SUBMIT_LOGS_DIR, file));

		const submitFileName = file.slice(0, file.lastIndexOf('.log'));

		let data = {
			user: '',
			name: '',
			ext: '',
		};

		const extDot = submitFileName.lastIndexOf('.');
		data.ext = submitFileName.slice(extDot + 1);
		const elements = submitFileName.slice(submitFileName.indexOf('['), extDot).split('][');
		data.user = elements[0].slice(1);
		data.name = elements[1].slice(0, -1);

		if (!db[data.user]) db[data.user] = {};
		if (!db[data.user][data.name]) db[data.user][data.name] = {};

		const score = parseFloat(statusText.split(': ')[1]);

		if (isNaN(score)) {
			db[data.user][data.name][data.ext] = {
				judged: false,
				score: 0,
			};
		} else {
			db[data.user][data.name][data.ext] = {
				judged: true,
				score,
			};
		}
	} catch (e) {
		logger.error(`Cannot load submit data from ${file}`, e);
	}
}

function deleteSubmitFile(file: string): void {
	logger.info(`Removing submit data from ${file}`);
	const submitFileName = file.slice(0, file.lastIndexOf('.log'));

	let data = {
		user: '',
		name: '',
		ext: '',
	};

	const extDot = submitFileName.lastIndexOf('.');
	data.ext = submitFileName.slice(extDot + 1);
	const elements = submitFileName.slice(submitFileName.indexOf('['), extDot).split('][');
	data.user = elements[0].slice(1);
	data.name = elements[1].slice(0, -1);

	delete db[data.user][data.name][data.ext];
}

function getSubmitLogOverview(file: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(file, { encoding: 'utf-8' });

		let acc = '';
		let pos = 0;
		let index = -1;

		readStream
			.on('data', (chunk) => {
				index = chunk.indexOf('\n');
				acc += chunk;
				if (index != -1) readStream.close();
				else pos += chunk.length;
			})
			.on('close', () => {
				resolve(acc.slice(0, pos + index));
			})
			.on('error', (err) => {
				reject(err);
			});
	});
}

const logsWatcher = chokidar.watch(SUBMIT_LOGS_DIR);

logsWatcher.on('add', (filePath) => {
	const fileName = path.basename(filePath);
	if (filePath.endsWith('.log')) {
		loadSubmitFile(fileName);
	}
});

logsWatcher.on('change', (filePath) => {
	const fileName = path.basename(filePath);
	if (filePath.endsWith('.log')) {
		loadSubmitFile(fileName);
	}
});

logsWatcher.on('unlink', (filePath) => {
	const fileName = path.basename(filePath);
	if (filePath.endsWith('.log')) {
		deleteSubmitFile(fileName);
	}
});
