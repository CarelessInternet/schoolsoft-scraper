require('dotenv').config();

const SchoolSoft = require('../src/index.js');
const school = new SchoolSoft(
	process.env.SCHOOLSOFT_SCHOOL,
	process.env.CHROMIUM_PATH
);

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
	await school.close();
});

test(
	'login to schoolsoft',
	async () => {
		await expect(
			school.login(
				process.env.SCHOOLSOFT_USERNAME,
				process.env.SCHOOLSOFT_PASSWORD
			)
		).resolves.toBe(`${school.baseURL}/student/right_student_startpage.jsp`);
	},
	10 * 1000
);

test(
	'grab lunch menu',
	async () => {
		return school.getLunchMenu().then((data) => {
			expect(data).toHaveProperty('heading');
			expect(data).toHaveProperty('dates');
			expect(data).toHaveProperty('menu');
		});
	},
	15 * 1000
);

test('close the browser', async () => {
	await expect(school.close()).resolves.toBe(true);
});
