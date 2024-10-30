const languages_mode_db = {
	cpp: 'c_cpp',
	c: 'c_cpp',
	pas: 'pascal',
	java: 'java',
	python: 'python',
};
const username = document.getElementById('user-id').innerHTML;

const rankingButton = document.getElementById('ranking-btn');
const userButton = document.getElementById('user-btn');
const userMenu = document.getElementById('user-menu');
const repassButton = document.getElementById('repass-btn');
const logoutButton = document.getElementById('logout-btn');
const fileChooser = document.getElementById('choose-file');
const codeEditor = document.getElementById('ace-editor');
const fileNameInput = document.getElementById('file-name');
const submitButton = document.getElementById('submit-btn');
const problemsArea = document.getElementById('doc-files');
const resultsArea = document.getElementById('results');
const editor = ace.edit('ace-editor');

function deleteCookie(name) {
	document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

rankingButton.onclick = () => window.open('/ranking');
userButton.onclick = () => userMenu.classList.toggle('hidden');
repassButton.onclick = () => (window.location = '/repass');
logoutButton.onclick = () => {
	deleteCookie('token');
	window.location = '/login';
};

function handleFileNameChange(name) {
	const fileExt = name.split('.').at(-1);
	editor.session.setMode(`ace/mode/${languages_mode_db[fileExt]}`);
}

fileNameInput.onchange = (e) => handleFileNameChange(e.target.value);

fileChooser.onchange = () => {
	const file = fileChooser.files[0];
	const reader = new FileReader();
	reader.readAsText(file, 'UTF-8');
	reader.onload = () => {
		editor.session.setValue(reader.result);
		fileNameInput.value = file.name;
		handleFileNameChange(file.name);
	};
};

async function updateProblems() {
	const res = await fetch(`/problem?json=1`);
	const problems = await res.json();

	let rendereds = [];
	problems.map((problem) => {
		const icon = problem.isDir
			? `<img src="/assets/directory.svg" height="17" />`
			: `<img src="/assets/file.svg" height="17" />`;

		rendereds.push(`
			<div class="file-browser-element">
				${icon}
				<a target="_blank" href="/problem${problem.path}">${problem.name}</a>
			</div>
		`);
	});

	problemsArea.innerHTML = rendereds.join('');
}

async function updateResults() {
	const res = await fetch(`/submit/get/${username}`);
	const results = await res.json();

	let rendereds = [];
	results.map((result) => {
		rendereds.push(
			`&bull; <span>${result.name}.${result.ext}</span> <a target="_blank" href="/submit/result/${result.name}/${result.ext}">(${result.score})</a> <a target="_blank" href="/submit/submit/${result.name}/${result.ext}">(Xem lại)</a>`
		);
	});

	resultsArea.innerHTML = rendereds.join('<br/>');
}

submitButton.onclick = async () => {
	const content = editor.session.getValue();
	const fileName = fileNameInput.value;
	const pos = fileName.lastIndexOf('.');

	if (pos == -1) {
		alert('Tên file không hợp lệ');
	} else {
		const problemName = fileName.slice(0, pos);
		const fileExt = fileName.slice(pos + 1);

		if (!problemName || !fileExt) {
			alert('Tên file không hợp lệ');
		} else {
			const res = await fetch(`/submit/new/${problemName}/${fileExt}`, {
				method: 'POST',
				body: content,
			});

			if (res.ok) {
				alert('Nộp bài thành công');
			} else {
				alert('Xảy ra lỗi khi nộp bài');
			}
		}
	}
};

updateProblems();
updateResults();
setInterval(() => {
	if (!document.hidden) {
		updateProblems();
		updateResults();
	}
}, 1000);
