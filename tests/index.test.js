require('dotenv').config();

const SchoolSoft = require('../src/index.js');
const school = new SchoolSoft('engelska', '/usr/bin/chromium-browser');

test('get username typeof error', async () => {
	await expect(school.login(12345, 'yee')).rejects.toBe(
		'Username must be of type string'
	);
});

test('get password typeof error', async () => {
	await expect(school.login('yee', 12345)).rejects.toBe(
		'Password must be of type string'
	);
});

test('get invalid credentials', async () => {
	await expect(school.login('bruh', 'moment')).rejects.toBe(
		'Invalid username or password'
	);
});

test(
	'login to schoolsoft',
	async () => {
		await expect(
			school.login(
				process.env.SCHOOLSOFT_USERNAME,
				process.env.SCHOOLSOFT_PASSWORD
			)
		).resolves.toBe(true);
	},
	10 * 1000
);

test(
	'grab lunch menu',
	async () => {
		await expect(school.getLunchMenu(true)).resolves.toMatchObject({
			success: true
		});
	},
	15 * 1000
);

test('close the browser', async () => {
	await expect(school.close()).resolves.toBe(true);
});
