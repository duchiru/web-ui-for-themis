import bodyParser from 'body-parser';
import { Router } from 'express';
import { createResult, getOneSubmit } from '../utils/submits';
import fs from 'fs';
import { SUBMIT_DIR } from '../utils/configs';
import path from 'path';

const judger = Router();

judger.get('/one-submission', (_req, res) => {
	const submit = getOneSubmit();
	if (!submit) return res.status(404).end();

	res.setHeader('filename', submit);

	const stream = fs.createReadStream(path.join(SUBMIT_DIR, submit));
	stream.pipe(res);
	stream.on('close', () => res.end());
});

judger.post('/result/:filename', bodyParser.text(), (req, res) => {
	createResult(req.params.filename, req.body);
	res.status(201).end();
});

export default judger;
