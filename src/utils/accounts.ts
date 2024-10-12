import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import chokidar from 'chokidar';
import logger from './logging';
import { ACCOUNTS_FILE } from './configs';

interface Account {
	username: string;
	password: string;
	fullname: string;
}

let accounts: Account[] = [];
let header = {
	username: 0,
	password: 1,
	fullname: 2,
};
let skipNextChange = false;

function parseAccountsFile() {
	accounts = [];

	const content = fs.readFileSync(ACCOUNTS_FILE, { encoding: 'utf-8' }).toString();
	const records = parse(content, {
		skip_empty_lines: true,
		delimiter: ',',
	});

	header = {
		username: records[0].indexOf('username'),
		password: records[0].indexOf('password'),
		fullname: records[0].indexOf('fullname'),
	};

	for (let i = 1; i < records.length; i++) {
		accounts.push({
			username: records[i][header.username],
			password: records[i][header.password],
			fullname: records[i][header.fullname],
		});
	}
}

function stringifyAccounts() {
	const records = [['', '', '']];

	records[0][header.username] = 'username';
	records[0][header.password] = 'password';
	records[0][header.fullname] = 'fullname';

	for (let account of accounts) {
		const record = ['', '', ''];
		record[header.username] = account.username;
		record[header.password] = account.password;
		record[header.fullname] = account.fullname;

		records.push(record);
	}

	const content = stringify(records, {
		delimiter: ',',
	});

	fs.writeFileSync(ACCOUNTS_FILE, content);
}

export function getAccounts() {
	return accounts;
}

export function setAccount(username: string, password: string) {
	for (let i = 0; i < accounts.length; i++) {
		if (accounts[i].username == username) {
			accounts[i].password = password;
		}
	}

	skipNextChange = true;
	stringifyAccounts();
}

if (!fs.existsSync(ACCOUNTS_FILE)) {
	fs.writeFileSync(ACCOUNTS_FILE, 'username,password,fullname');
}

chokidar.watch(ACCOUNTS_FILE).on('change', () => {
	if (skipNextChange) {
		skipNextChange = false;
	} else {
		try {
			logger.info('Accounts file changes detected, reloading...');
			parseAccountsFile();
		} catch (e) {
			logger.error('Cannot load data from account file', e);
		}
	}
});

parseAccountsFile();
