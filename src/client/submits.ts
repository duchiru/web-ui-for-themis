import { Router } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import logger from '../utils/logging';
import { createSubmit, getAllSubmits, getSubmitResultContent, getSubmits } from '../utils/submits';
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

				logger.info(`Processing submit for problem: ${problem} by user: ${username}`);

				try {
					createSubmit(`[${username}][${problem}].${req.params.ext}`, req.body);
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

submit.get('/view/:file', (req, res) => {
	if (!ENABLE_SUBMIT_VIEW)
		return res.send('Bạn không được cho phép để xem trạng thái bài nộp').end();

	try {
		res.write(getSubmitResultContent(req.params.file));
		res.end();
	} catch (e) {
		res.status(404).end();
	}
});

submit.get('/all', (_req, res) => {
	res.json(getAllSubmits()).end();
});

export default submit;
