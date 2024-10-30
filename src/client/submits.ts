import { Router } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import logger from '../utils/logging';
import {
	createSubmit,
	getAllSubmits,
	getSubmitContent,
	getSubmitResultContent,
	getSubmits,
} from '../utils/submits';
import { parseToken } from '../utils/token';
import { getAccounts } from '../utils/accounts';
import { ENABLE_SUBMIT_VIEW } from '../utils/configs';

const submit = Router();

submit.post('/new/:id/:ext', cookieParser(), bodyParser.text(), (req, res) => {
	const token = req.cookies.token;
	if (!token) {
		res.status(401).end();
	} else {
		const username = parseToken(token);
		if (!username) {
			res.status(401).end();
		} else {
			const acc = getAccounts().find((acc) => acc.username == username);

			if (!acc) {
				return res.status(401).end();
			} else {
				const problem = req.params.id.toUpperCase();
				const ext = req.params.ext.toLowerCase();

				logger.info(`Processing submit for problem: ${problem} by user: ${username}`);

				try {
					createSubmit(`[${username}][${problem}].${ext}`, req.body);
					res.status(201).end();
				} catch (e) {
					logger.error(`Cannot create submission: `, e);
					return res.status(500).end();
				}
			}
		}
	}
});

submit.get('/get/:user', async (req, res) => {
	getSubmits(req.params.user)
		.then((submits) => res.json(submits).end())
		.catch(() => res.json([]).end());
});

submit.get('/result/:id/:ext', cookieParser(), (req, res) => {
	if (!ENABLE_SUBMIT_VIEW)
		return res.send('Bạn không được cho phép để xem trạng thái bài nộp').end();

	const token = req.cookies.token;
	if (!token) {
		res.status(401).end();
	} else {
		const username = parseToken(token);
		if (!username) {
			res.status(401).end();
		} else {
			const acc = getAccounts().find((acc) => acc.username == username);

			if (!acc) {
				return res.status(401).end();
			} else {
				const problem = req.params.id.toUpperCase();
				const ext = req.params.ext.toLowerCase();

				try {
					res.write(getSubmitResultContent(`[${username}][${problem}].${ext}.log`));
					res.end();
				} catch (e) {
					res.status(404).end();
				}
			}
		}
	}
});

submit.get('/submit/:id/:ext', cookieParser(), (req, res) => {
	if (!ENABLE_SUBMIT_VIEW)
		return res.send('Bạn không được cho phép để xem trạng thái bài nộp').end();

	const token = req.cookies.token;
	if (!token) {
		res.status(401).end();
	} else {
		const username = parseToken(token);
		if (!username) {
			res.status(401).end();
		} else {
			const acc = getAccounts().find((acc) => acc.username == username);

			if (!acc) {
				return res.status(401).end();
			} else {
				const problem = req.params.id.toUpperCase();
				const ext = req.params.ext.toLowerCase();

				try {
					res.write(getSubmitContent(`[${username}][${problem}].${ext}`));
					res.end();
				} catch (e) {
					res.status(404).end();
				}
			}
		}
	}
});

submit.get('/all', (_req, res) => {
	res.json(getAllSubmits()).end();
});

export default submit;
