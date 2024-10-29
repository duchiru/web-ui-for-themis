const path = require('path');
const fs = require('fs');

function rmDir(dirName) {
	const dirToRm = path.join(process.cwd(), dirName);
	if (fs.existsSync(dirToRm)) {
		const stat = fs.lstatSync(dirToRm);

		if (stat.isDirectory()) {
			console.log(`Removing ${dirToRm} for a build in future...`);
			fs.rmSync(dirToRm, { recursive: true });
		} else {
			console.error(`${dirToRm} is not a directory, please check...`);
			process.exit(1);
		}
	} else {
		console.log(`${dirToRm} is not found, skipping...`);
	}
}

rmDir('out');
rmDir('build');
