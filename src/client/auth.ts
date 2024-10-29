import { Router } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { getAccounts, setAccount } from '../utils/accounts';
import { genToken, parseToken } from '../utils/token';
import logger from '../utils/logging';

const auth = Router();

auth.post('/login', bodyParser.urlencoded({ extended: true }), (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (!username || !password) {
		res.redirect('/login?retry=1');
	} else {
		logger.info(`Processing login request for user: ${username}`);

		const acc = getAccounts().find((acc) => acc.username == username);

		if (!acc || acc.password != password) {
			res.redirect('/login?retry=1');
		} else {
			const token = genToken(username);
			res.cookie('token', token).redirect('/');
		}

		res.end();
	}
});

auth.post('/repass', bodyParser.urlencoded({ extended: true }), cookieParser(), (req, res) => {
	const token = req.cookies.token;

	if (!token) {
		res.redirect('/login');
	} else {
		const username = parseToken(token);

		if (!username) {
			res.redirect('/login');
		} else {
			const oldPassword = req.body.password;
			const newPassword = req.body.newPassword;
			const repeatNewPassword = req.body.repeatNewPassword;

			if (!oldPassword || !newPassword || !repeatNewPassword) {
				res.redirect('/repass?retry=1');
			} else {
				if (newPassword != repeatNewPassword) {
					res.redirect('/repass?retry=1');
				} else {
					logger.info(`Processing repass request for user: ${username}`);

					const acc = getAccounts().find((acc) => acc.username == username)!;

					if (acc.password != oldPassword) {
						res.redirect('/repass?retry=1');
					} else {
						setAccount(username, newPassword);
						res.redirect('/');
					}
				}
			}
		}
	}

	res.end();
});

export default auth;
