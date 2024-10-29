const axios = require('axios');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const SUBMIT_DIR = process.env.DIR;
const SERVER_URL = process.env.ADR;

const SUBMIT_LOG_DIR = path.join(SUBMIT_DIR, 'Logs');

if (!fs.existsSync(SUBMIT_DIR)) fs.mkdirSync(SUBMIT_DIR);
if (!fs.existsSync(SUBMIT_LOG_DIR)) fs.mkdirSync(SUBMIT_LOG_DIR);

const client = axios.create({
	baseURL: SERVER_URL,
});

function getSubmission() {
	client
		.get('/one-submission')
		.then((res) => {
			const filename = res.headers['filename'];

			console.log('Processing submission: ' + filename);
			fs.writeFileSync(path.join(SUBMIT_DIR, filename), res.data);
		})
		.catch(() => {});
}

function postResult(filename) {
	console.log('Posting result: ' + filename);

	client.post(
		`/result/${filename}`,
		fs.readFileSync(path.join(SUBMIT_LOG_DIR, filename)).toString(),
		{
			headers: {
				'Content-Type': 'text/plain; charset=UTF-8',
			},
		}
	);
}

const watcher = chokidar.watch(SUBMIT_LOG_DIR);

watcher.on('add', (filePath) => {
	const fileName = path.basename(filePath);
	if (fileName.endsWith('.log')) {
		postResult(fileName);
		fs.rmSync(filePath);
	}
});

watcher.on('change', (filePath) => {
	const fileName = path.basename(filePath);
	if (fileName.endsWith('.log')) {
		postResult(fileName);
		fs.rmSync(filePath);
	}
});

setInterval(getSubmission, 1000);
