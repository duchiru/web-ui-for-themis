const fs = require('fs');
const path = require('path');
const { dependencies, name, version, author } = require('../package.json');

const buildDir = path.join(process.cwd(), 'build');
const packageFile = path.join(buildDir, 'package.json');
const dirs = ['out', 'data', 'public', 'views'];

for (let dir of dirs) {
	console.log(`Copying ${dir}...`);
	fs.cpSync(path.join(process.cwd(), dir), path.join(buildDir, dir), { recursive: true });
}

fs.writeFileSync(
	packageFile,
	JSON.stringify({ name, version, author, main: 'out/main.js', dependencies }, undefined, 4)
);
