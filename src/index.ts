import puppeteer, {
	Browser,
	BrowserLaunchArgumentOptions,
	LaunchOptions,
	Page
} from 'puppeteer-core';
import { LunchMenu, News } from './types';

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
	constructor(
		public school: string,
		path: string = '/usr/bin/chromium-browser'
	) {
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
	 * 	menu: [{title: '', lunch: ''}, ...]
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
	 * 			heading: '', content: '', date: '', from: '', to: ''
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

			// absolute mess of code
			const getNewsItems = async (element: Element) => {
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
						...(accordionLeft?.querySelectorAll('.tinymce-p') ?? [])
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

			let news = [];
			for (let i = 0, all = mainElement.children; i < all.length; i++) {
				if (all[i].classList.contains('h3_bold')) {
					const categoryName = all[i].innerHTML;
					const newsItem = await getNewsItems(all[i + 1]);

					news.push({ category: categoryName, news: newsItem });
				}
			}

			return news;
		});

		return news;
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
