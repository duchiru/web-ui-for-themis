import crypto from 'crypto';

let db: Record<string, string> = {};

async function checkToken(excluded: string) {
	const tokens = Object.keys(db);
	const username = db[excluded];

	tokens.forEach((token) => {
		if (token !== excluded && db[token] == username) {
			delete db[token];
		}
	});
}

export function genToken(username: string) {
	const token = crypto.randomBytes(64).toString('hex');
	db[token] = username;
	checkToken(token);
	return token;
}

export function parseToken(token: string) {
	return db[token];
}
