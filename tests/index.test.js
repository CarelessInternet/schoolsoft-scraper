const SchoolSoft = require('../src/index.js');

const school = new SchoolSoft('engelska', '/usr/bin/chromium-browser');

test('get invalid credentials', async () => {
	await expect(school.login('bruh', 'moment')).rejects.toBe(
		'Invalid username or password'
	);
});

// test(
// 	'login to schoolsoft',
// 	async () => {
// 		await expect(
// 			school.login('credentials', 'credentials')
// 		).resolves.toBe(true);
// 	},
// 	10 * 1000
// );

test(
	'grab lunch menu',
	async () => {
		await expect(school.getLunchMenu()).resolves.toBe(
			'Lunch menu 39, 27 sep - 1 okt'
		);
	},
	15 * 1000
);

test('close the browser', async () => {
	await expect(school.close()).resolves.toBe(true);
});
