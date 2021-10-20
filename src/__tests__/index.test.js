require('dotenv').config();

const { default: SchoolSoft } = require('../../dist/index');
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
	return school.getLunchMenu(40).then((data) => {
		expect(data).toHaveProperty('heading');
		expect(data).toHaveProperty('menu');
	});
});

test('grab lunch when there is no school (empty array)', async () => {
	await expect(school.getLunchMenu(30)).resolves.toHaveProperty('menu', []);
});

/* NEWS */

test('fetch news', () => {
	return school.getNews().then((data) => {
		expect(data).toBeDefined();
		expect(data[0]).toHaveProperty('category');
		expect(data[0]).toHaveProperty(['news', 0, 'content']);
	});
});

/* ASSIGNMENTS */

test('fetch new and old assignments', () => {
	return school.getAssignments().then((data) => {
		expect(data).toBeDefined();
		expect(data.upcoming[0]).toHaveProperty('heading');
		expect(data.old[0]).toHaveProperty('heading');
	});
});

/* RESULTS */

test('fetch new and old results', () => {
	return school.getResults().then((data) => {
		expect(data).toBeDefined();
		expect(data.new[0]).toHaveProperty('heading');
		expect(data.old[0]).toHaveProperty('heading');
	});
});

/* WEEKLY PLANNING */

test(
	'fetch weekly planning',
	() => {
		return school.getWeeklyPlanning().then((data) => {
			expect(data).toBeDefined();
			expect(data[0]).toHaveProperty('subject');
			expect(data[0]).toHaveProperty('planning', 0, 'content');
		});
	},
	10 * 1000
);

/* CLOSE */

test('close the browser', async () => {
	await expect(school.close()).resolves.toBe(true);
});
