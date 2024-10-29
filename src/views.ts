import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { parseToken } from './utils/token';
import { getAccounts } from './utils/accounts';

const views = Router();

views.get('/', cookieParser(), (req, res) => {
	const token = req.cookies.token;

	if (!token) {
		res.redirect('/login');
	} else {
		const username = parseToken(token);
		if (!username) {
			res.redirect('/login');
		} else {
			const acc = getAccounts().find((acc) => acc.username === username)!;

			res.render('home', { username: acc.fullname || acc.username, userId: acc.username });
		}
	}

	res.end();
});

views.get('/login', cookieParser(), (req, res) => {
	const token = req.cookies.token;
	const retry = req.query.retry;

	if (!token) {
		res.render('login', { failed: retry });
	} else {
		const username = parseToken(token);
		if (!username) {
			res.render('login', { failed: retry });
		} else {
			res.redirect('/');
		}
	}

	res.end();
});

views.get('/repass', cookieParser(), (req, res) => {
	const token = req.cookies.token;
	const retry = req.query.retry;

	if (!token) {
		res.redirect('/login');
	} else {
		const username = parseToken(token);
		if (!username) {
			res.redirect('/login');
		} else {
			res.render('repass', { failed: retry });
		}
	}

	res.end();
});

views.get('/ranking', cookieParser(), (req, res) => {
	const token = req.cookies.token;

	if (!token) {
		res.redirect('/login');
	} else {
		res.render('ranking');
	}

	res.end();
});

export default views;
