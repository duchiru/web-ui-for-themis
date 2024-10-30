const table = document.getElementById('table');

async function updateRank() {
	const submitsDb = await fetch('/submit/all').then((res) => res.json());
	const data = {};
	const problems = new Set();

	Object.keys(submitsDb).forEach((user) => {
		if (!data[user]) data[user] = {};
		Object.keys(submitsDb[user]).forEach((problem) => {
			let score = -1;

			Object.keys(submitsDb[user][problem]).forEach((ext) => {
				if (submitsDb[user][problem][ext].judged) {
					score = Math.max(score, submitsDb[user][problem][ext].score);
				}
			});

			data[user][problem] = score;
			problems.add(problem);
		});
	});

	let headers = [...problems].sort();
	let rows = [];
	Object.keys(data).forEach((user, index) => {
		const scores = Array(headers.length);
		let sum = 0;
		for (let i = 0; i < headers.length; i++) {
			if (headers[i] in data[user]) {
				scores[i] = data[user][headers[i]] < 0 ? 'Chưa chấm' : data[user][headers[i]];
				sum += Math.max(data[user][headers[i]], 0);
			} else {
				scores[i] = '';
			}
		}

		rows[index] = [user, sum, ...scores];
	});

	rows.sort((a, b) => b[1] - a[1]);
	headers = ['Thí sinh', 'Tổng điểm', ...headers];

	const rowsData = [headers, ...rows];
	const renderedRows = [];

	renderedRows[0] = '';
	for (let i = 0; i < rowsData[0].length; i++) renderedRows[0] += `<th>${rowsData[0][i]}</th>`;

	for (let i = 1; i < rowsData.length; i++) {
		renderedRows[i] = '';
		for (let j = 0; j < rowsData[i].length; j++) renderedRows[i] += `<td>${rowsData[i][j]}</td>`;
	}

	table.innerHTML = renderedRows.map((row) => `<tr>${row}</tr>`).join('');
}

updateRank();
setInterval(() => {
	if (!document.hidden) updateRank();
}, 1000);
