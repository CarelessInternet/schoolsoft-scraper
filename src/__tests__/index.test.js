require('dotenv').config();

const SchoolSoft = require('../../dist/index').default;
const school = new SchoolSoft(
	process.env.SCHOOLSOFT_SCHOOL,
	process.env.CHROMIUM_PATH
);

/* LOGIN */

test('get invalid credentials', async () => {
	await expect(school.login('bruh', 'moment')).rejects.toThrowError(
		'Invalid username or password, or an unknown error occured'
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
		).resolves.toBe(`${school.baseURL}/student/right_student_startpage.jsp`);
	},
	10 * 1000
);

/* LUNCH */

test('grab lunch menu', () => {
	return school.getLunchMenu().then((data) => {
		expect(data).toHaveProperty('heading');
		expect(data).toHaveProperty('menu');
	});
});

test('grab lunch menu with specified week number', () => {
	return school.getLunchMenu().then((data) => {
		expect(data).toHaveProperty('heading');
		expect(data).toHaveProperty('menu');
	});
});

test('fail to grab lunch with invalid week number (no school during that week)', async () => {
	await expect(school.getLunchMenu(30)).resolves.toHaveProperty('menu', []);
});

/* CLOSE */

test('close the browser', async () => {
	await expect(school.close()).resolves.toBe(true);
});
