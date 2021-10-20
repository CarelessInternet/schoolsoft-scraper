// i would like to apologize for a lack of comments

import puppeteer, {
	Browser,
	BrowserLaunchArgumentOptions,
	LaunchOptions,
	Page
} from 'puppeteer-core';
import {
	AssignmentKeys,
	Assignments,
	LunchMenu,
	News,
	NewsCategoryAndNews,
	NewsKeys,
	ResultKeys,
	Results,
	WeeklyPlanning,
	WeeklyPlanningKeys,
	WeeklyPlanningSubjectAndPlanning
} from './types';

/**
 * The SchoolSoft class, everything is defined in here. Only compatible with student accounts
 * @example <caption>CommonJS Require</caption>
 * const SchoolSoft = require('schoolsoft-scraper').default;
 * // OR
 * const { default: SchoolSoft } = require('schoolsoft-scraper');
 * @example <caption>ES6 Import/TypeScript</caption>
 * import SchoolSoft from 'schoolsoft-scraper';
 */
export default class SchoolSoft {
	private loggedIn = false;
	private puppeteerOptions: LaunchOptions & BrowserLaunchArgumentOptions = {
		headless: true
	};
	private browser: Browser;
	private page: Page;

	public baseURL: string;

	/**
	 * Initializes the SchoolSoft class
	 * @param {string} school - The school being accessed
	 * @param {string} path - The path to the chromium executable
	 * @example <caption>CommonJS Require</caption>
	 * const SchoolSoft = require('schoolsoft-scraper').default;
	 * const school = new SchoolSoft('engelska', '/usr/bin/chromium-browser');
	 * // OR
	 * const { default: SchoolSoft } = require('schoolsoft-scraper');
	 * const school = new SchoolSoft('engelska', '/usr/bin/chromium-browser');
	 * @example <caption>ES6 Import/TypeScript</caption>
	 * import SchoolSoft from 'schoolsoft-scraper';
	 * const school = new SchoolSoft('medborgarskolan', '/usr/bin/chromium-browser');
	 */
	constructor(public school: string, path = '/usr/bin/chromium-browser') {
		this.baseURL = `https://sms14.schoolsoft.se/${school}/jsp`;
		this.puppeteerOptions.executablePath = path;
	}

	/**
	 * Launches puppeteer with an incognito tab and opens a page
	 * @async
	 * @private
	 * @returns {Promise<boolean>} Returns true on success, else false
	 */
	private async open(): Promise<boolean> {
		try {
			this.browser = await puppeteer.launch(this.puppeteerOptions);
			const context = await this.browser.createIncognitoBrowserContext();
			this.page = await context.newPage();

			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 * Returns true if the user is logged in, else throw error
	 * @async
	 * @private
	 * @returns {Promise<boolean>} Returns error if user is not logged in
	 */
	private async isLoggedIn(): Promise<boolean> {
		if (!this.loggedIn) {
			throw new Error('User is not logged in');
		}

		return true;
	}

	/**
	 * Login to SchoolSoft
	 * @async
	 * @public
	 * @param {string} username - The username for the user
	 * @param {string} password - The password for the user
	 * @returns {Promise<string>} Returns the redirected URL on success, else returns the error
	 * @example <caption>Login with .then()</caption>
	 * school.login('sample', 'text')
	 * .then(console.log)
	 * .catch(console.error)
	 */
	public async login(username: string, password: string): Promise<string> {
		// open puppeteer if there is no instance of browser and page
		if (!this.browser && !this.page) {
			const opened = await this.open();

			if (!opened) {
				throw new Error('Could not open SchoolSoft');
			}
		}

		await this.page.goto(`${this.baseURL}/Login.jsp?usertype=1`);
		await this.page.type('input#ssusername', username);
		await this.page.type('input#sspassword', password);

		await this.page.click('input[type="submit"]');

		// wait for redirect to later confirm that we have been successfully logged in
		await this.page.waitForNavigation();

		const url = this.page.url();

		if (url !== `${this.baseURL}/student/right_student_startpage.jsp`) {
			throw new Error(
				'Invalid username or password, or an unknown error occured'
			);
		}

		this.loggedIn = true;
		return url;
	}

	/**
	 * Fetches the menu
	 * @async
	 * @private
	 * @returns {Promise<LunchMenu>} Returns the lunch menu on success, returns string on failure
	 * @example
	 * school.fetchLunchMenu()
	 * .then(console.log)
	 * .catch(console.error)
	 */
	private async fetchLunchMenu(): Promise<LunchMenu> {
		// get table which includes the lunch menu
		const element = await this.page.$x(
			'//*[@id="lunchmenu_con_content"]/table[1]'
		);

		// if there is no lunch, return empty results
		if (!element.length) {
			return { heading: '', menu: [] };
		}

		const [headingHandle] = await this.page.$x(
			'//*[@id="lunchmenu_con"]/div[1]/div[2]'
		);
		const heading = await headingHandle.evaluate((el) => el.innerHTML);

		// iterate through list of dates
		const dates = await this.page.evaluate(() => {
			const headings = Array.from(
				document.querySelectorAll('div[class="h3_bold"]')
			);
			return headings.map((td) => td.innerHTML);
		});

		// iterate through the lunch list
		const lunchMenu = await this.page.evaluate(() => {
			const tables = Array.from(
				document.querySelectorAll('td[style="word-wrap: break-word"]')
			);
			return tables.map((td) => td.innerHTML);
		});

		// schoolsoft doesnt like wrapping the date and lunch menu into their own divs
		// so i have to iterate through the date and lunch menu and add them
		// into an array of objects
		const menu = lunchMenu.map((value, index) => {
			return { title: dates[index], lunch: value };
		});

		return { heading, menu };
	}

	/**
	 * Gets the lunch menu
	 * @async
	 * @public
	 * @param {Number} [week] - The week's lunch you want to get
	 * @returns {Promise<LunchMenu>} Returns the lunch menu and metadata in object form on success
	 * @example <caption>Function without week</caption>
	 * school.getLunchMenu()
	 * .then(console.log)
	 * .catch(console.error);
	 * @example <caption>Function with week</caption>
	 * school.getLunchMenu(37)
	 * .then(console.log)
	 * .catch(console.error)
	 * @example <caption>Response example</caption>
	 * {
	 * 	heading: '',
	 * 	menu: [{title, lunch}, ...]
	 * }
	 */
	public async getLunchMenu(week?: number): Promise<LunchMenu> {
		await this.isLoggedIn();

		if (week) {
			if (!Number.isInteger(week)) {
				throw new Error('Week must be an integer');
			}

			await this.page.goto(
				`${this.baseURL}/student/right_student_lunchmenu.jsp?requestid=${week}`
			);

			const menu = await this.fetchLunchMenu();
			return menu;
		} else {
			await this.page.goto(
				`${this.baseURL}/student/right_student_lunchmenu.jsp`
			);

			const menu = await this.fetchLunchMenu();
			return menu;
		}
	}

	/**
	 * Gets the current news
	 * @async
	 * @public
	 * @returns {Promise<News>} Returns data about each news, split into categories
	 * @example
	 * school.getNews()
	 * .then(console.log)
	 * .catch(console.error)
	 * @example <caption>Response example</caption>
	 * [{
	 * 	category: '',
	 * 	news: [{
	 * 		heading, content, date, from, to
	 * 	}]
	 * }]
	 */
	public async getNews(): Promise<News> {
		await this.isLoggedIn();
		await this.page.goto(`${this.baseURL}/student/right_student_news.jsp`);

		const [container] = await this.page.$x('//*[@id="news_con_content"]');
		const news: News = await container.evaluate(async (mainElement) => {
			if (!mainElement.hasChildNodes()) {
				return [];
			}

			const getNewsItems = async (element: Element): Promise<NewsKeys[]> => {
				return Array.from(element.children).map((el) => {
					const preHeading = el.querySelector('.accordion-heading-left');
					const heading =
						preHeading?.querySelector('div > span')?.innerHTML ?? '';

					const [accordionLeft, innerRightInfo] = [
						el.querySelector('.accordion_inner_left'),
						el.querySelector('.inner_right_info')
					];

					// what is this? idk https://stackoverflow.com/questions/27983388/using-innerhtml-with-queryselectorall
					const content = [
						...(accordionLeft?.querySelectorAll('.tinymce-p, ul') ?? [])
					].reduce((acc, curr) => acc + `${curr.innerHTML}\n`, '');

					const from =
						innerRightInfo?.querySelector('div:nth-child(2)')?.innerHTML ?? '';
					const to =
						innerRightInfo?.querySelector('div:nth-child(4)')?.innerHTML ?? '';
					const date =
						el.querySelector('.accordion-heading-date-wide')?.innerHTML ?? '';

					return {
						heading,
						content,
						date,
						from,
						to
					};
				});
			};

			const newsStuff: NewsCategoryAndNews[] = [];
			for (let i = 0, all = mainElement.children; i < all.length; i++) {
				if (all[i].classList.contains('h3_bold')) {
					const categoryName = all[i].innerHTML;
					const newsItem = await getNewsItems(all[i + 1]);

					newsStuff.push({ category: categoryName, news: newsItem });
				}
			}

			return newsStuff;
		});

		return news;
	}

	/**
	 * Gets the upcoming and old assignments
	 * @async
	 * @public
	 * @returns {Promise<Assignments>} Returns upcoming and old assignments in object form
	 * @example
	 * school.getAssignments()
	 * .then(console.log)
	 * .catch(console.error)
	 * @example <caption>Response example</caption>
	 * {
	 * 	upcoming: [{heading, content, date, lesson, teacher, type, id}],
	 * 	old: [{heading, content, date, lesson, teacher, type, id}]
	 * }
	 */
	public async getAssignments(): Promise<Assignments> {
		await this.isLoggedIn();
		await this.page.goto(`${this.baseURL}/student/right_student_test.jsp`);

		const [container] = await this.page.$x('//*[@id="test_con_content"]');
		const assignments: Assignments = await container.evaluate(
			async (mainElement) => {
				if (!mainElement.hasChildNodes()) {
					return {
						upcoming: [],
						old: []
					};
				}

				const getAssignmentsItems = async (
					element: Element
				): Promise<AssignmentKeys[]> => {
					return Array.from(element.children).map((el) => {
						const [accordionHeadingLeft, accordionHeadingRight] = [
							el.querySelector('.accordion-heading-left'),
							el.querySelector('.accordion-heading-right')
						];

						// prettier wtf is this?
						const date =
							accordionHeadingLeft?.querySelector('div:nth-child(1)')
								?.innerHTML ?? '';
						const heading =
							accordionHeadingLeft?.querySelector('div:nth-child(2)')
								?.innerHTML ?? '';
						const type =
							accordionHeadingRight?.querySelector('div:nth-child(1)')
								?.innerHTML ?? '';
						const lesson =
							accordionHeadingRight?.querySelector('div:nth-child(2)')
								?.innerHTML ?? '';

						const [accordionInnerLeft, accordionInnerRight] = [
							el.querySelector('.accordion_inner_left'),
							el.querySelector('.accordion_inner_right')
						];

						const content = [
							...(accordionInnerLeft?.querySelectorAll('.tinymce-p, ul') ?? [])
						].reduce((acc, curr) => acc + `${curr.innerHTML}\n`, '');

						const teacher =
							accordionInnerRight?.querySelector('div:nth-of-type(2)')
								?.innerHTML ?? '';

						// if no id is found for some reason, return 0 as the id
						const id = parseInt(
							accordionInnerLeft?.parentElement?.id.split('-')[1].slice(5) ??
								'0'
						);

						return {
							heading,
							content,
							date,
							lesson,
							teacher,
							type,
							id
						};
					});
				};

				const assignmentList = mainElement.querySelectorAll('#accordion');
				const [upcoming, old] = [
					await getAssignmentsItems(assignmentList[0]),
					await getAssignmentsItems(assignmentList[1])
				];

				return { upcoming, old };
			}
		);

		return assignments;
	}

	/**
	 * Gets the new and old results
	 * @async
	 * @public
	 * @returns {Promise<Results>} Returns new and old results in object form
	 * @example
	 * school.getResults()
	 * .then(console.log)
	 * .catch(console.error)
	 * @example <caption>Response example</caption>
	 * {
	 * 	new: [{heading, comment, description, date, lesson, teacher, type, id}],
	 * 	old: [{heading, comment, description, date, lesson, teacher, type, id}]
	 * }
	 */
	public async getResults(): Promise<Results> {
		await this.isLoggedIn();
		await this.page.goto(
			`${this.baseURL}/student/right_student_test_results.jsp`
		);

		// this code is very similar to the 'getAssignments' function
		const [container] = await this.page.$x('//*[@id="result_con_content"]');
		const results: Results = await container.evaluate(async (mainElement) => {
			if (!mainElement.hasChildNodes()) {
				return {
					new: [],
					old: []
				};
			}

			const getResultsItems = async (
				element: Element
			): Promise<ResultKeys[]> => {
				return Array.from(element.children).map((el) => {
					const accordionHeadingLeft = el.querySelector(
						'.accordion-heading-left'
					);
					const headingAndLesson = accordionHeadingLeft
						?.querySelector('div:nth-child(2)')
						?.innerHTML.split(' - ');

					const date =
						accordionHeadingLeft?.querySelector('div:nth-child(1)')
							?.innerHTML ?? '';
					const lesson = headingAndLesson?.[0] ?? '';
					const heading = headingAndLesson?.[1] ?? '';

					const [accordionInnerLeft, accordionInnerRight] = [
						el.querySelector('.accordion_inner_left'),
						el.querySelector('.accordion_inner_right')
					];

					const type =
						accordionInnerLeft?.querySelector('div:nth-of-type(1)')
							?.innerHTML ?? '';
					const comment =
						accordionInnerLeft?.querySelector('div:nth-of-type(3)')
							?.innerHTML ?? '';
					const teacher =
						accordionInnerRight?.querySelector('div:nth-of-type(4)')
							?.innerHTML ?? '';

					const preDescription =
						accordionInnerRight?.querySelector('div:nth-child(1)');
					const description = [
						...(preDescription?.querySelectorAll('.tinymce-p, ul') ?? [])
					].reduce((acc, curr) => acc + `${curr.innerHTML}\n`, '');

					// if no id is found for some reason, return 0 as the id
					const id = parseInt(
						accordionInnerLeft?.parentElement?.id.split('-')[1].slice(5) ?? '0'
					);

					return {
						heading,
						comment,
						description,
						date,
						lesson,
						teacher,
						type,
						id
					};
				});
			};

			const resultList = mainElement.querySelectorAll('#accordion');
			const [newResults, old] = [
				await getResultsItems(resultList[0]),
				await getResultsItems(resultList[1])
			];

			return { new: newResults, old };
		});

		return results;
	}

	/**
	 * Gets the weekly planning for each subject which has one
	 * @async
	 * @public
	 * @returns {Promise<WeeklyPlanning>} Returns the weekly planning
	 * @example
	 * school.getWeeklyPlanning()
	 * .then(console.log)
	 * .catch(console.error)
	 * @example <caption>Response example</caption>
	 * [{
	 * 	subject,
	 * 	planning: [
	 * 		{week, duration, content}
	 * 	]
	 * }]
	 */
	public async getWeeklyPlanning(): Promise<WeeklyPlanning> {
		await this.isLoggedIn();
		await this.page.goto(
			`${this.baseURL}/student/right_student_planning.jsp?objectpage=1#/overview/weeklyplanning`,
			{
				waitUntil: 'networkidle0'
			}
		);

		const [container] = await this.page.$x(
			'//*[@id="content"]/div/div[2]/div[2]/div/div'
		);
		const weeklyPlanning: WeeklyPlanning = await container.evaluate(
			async (mainElement) => {
				if (!mainElement.hasChildNodes()) {
					return [];
				}

				const getWeeklyPlanningItems = async (
					element: Element | null
				): Promise<WeeklyPlanningKeys[]> => {
					if (!element) {
						return [];
					}

					return Array.from(element.children).map((el) => {
						const [accordionHeadingLeft, accordionHeadingDateWide] = [
							el.querySelector('.accordion-heading-left'),
							el.querySelector('.accordion-heading-date-wide')
						];

						const weekText =
							accordionHeadingLeft?.querySelector(
								'div:nth-child(1)'
							)?.innerHTML;
						const week = parseInt(weekText?.split(' ').at(-1) ?? '0');
						const duration = accordionHeadingDateWide?.innerHTML ?? '';

						const contentText = el.querySelector('.accordion_text');
						const content = [
							...(contentText?.querySelectorAll('.tinymce-p, ul') ?? [])
						].reduce((acc, curr) => acc + `${curr.innerHTML}\n`, '');

						return {
							week,
							duration,
							content
						};
					});
				};

				const planningList: WeeklyPlanningSubjectAndPlanning[] = [];
				const eachSubject = mainElement.children;
				for (let i = 0; i < eachSubject.length; i++) {
					const subjectContainer = eachSubject[i];

					// stupid script tag in the container
					if (subjectContainer instanceof HTMLScriptElement) {
						continue;
					}

					const subjectText = subjectContainer.querySelector(
						'div:nth-child(1) > div:nth-child(2)'
					)?.innerHTML;
					const subject = subjectText?.split(' - ').at(-1) ?? '';

					const planningContainer =
						subjectContainer.querySelector('#accordion');
					const planning = await getWeeklyPlanningItems(planningContainer);

					planningList.push({ subject, planning });
				}

				return planningList;
			}
		);

		return weeklyPlanning;
	}

	/**
	 * Closes the browser, this should only be called after you are done with your session
	 * @async
	 * @public
	 * @returns {Promise<boolean>} Returns true on success
	 * @example
	 * school.close()
	 * .catch(console.error);
	 */
	public async close(): Promise<boolean> {
		await this.browser?.close();
		return true;
	}
}
