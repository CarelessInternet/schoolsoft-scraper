require('dotenv').config();

const SchoolSoft = require('../src/index.js');
const school = new SchoolSoft(
	process.env.SCHOOLSOFT_SCHOOL,
	process.env.CHROMIUM_PATH
);

/* LOGIN */

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

/* LUNCH */

test('grab lunch menu', async () => {
	return expect(school.getLunchMenu()).resolves.toHaveProperty('menu');
});

test('grab lunch with specified week number', async () => {
	return expect(school.getLunchMenu(37)).resolves.toHaveProperty('menu');
});

test('fail to grab lunch with invalid week number (no school during that week)', async () => {
	return expect(school.getLunchMenu(30)).rejects.toBe(
		'No lunch menu exists for that week'
	);
});

test('fail to grab lunch with invalid week type (string instead of number)', async () => {
	return expect(school.getLunchMenu('39')).rejects.toBe(
		'Week must be an integer'
	);
});

/* CLOSE */

test('close the browser', async () => {
	await expect(school.close()).resolves.toBe('Successfully closed SchoolSoft');
});
