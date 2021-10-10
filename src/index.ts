import puppeteer, {
	Browser,
	BrowserLaunchArgumentOptions,
	LaunchOptions,
	Page
} from 'puppeteer-core';

/**
 * The lunch menu response type
 */
export interface LunchMenu {
	heading: string;
	menu: {
		title: string;
		lunch: string;
	}[];
}

/**
 * The news response type
 */
export interface News {
	[index: number]: {
		category: string;
		news: {
			heading: string;
			content: string;
			date: string;
			from: string;
			to: string;
		}[];
	};
}

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

	public school: string;
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
	constructor(school: string, path: string) {
		this.school = school;
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
		const element = await this.page.$x(
			'//*[@id="lunchmenu_con_content"]/table[1]'
		);

		if (!element.length) {
			return { heading: '', menu: [] };
		}

		const [headingHandle] = await this.page.$x(
			'//*[@id="lunchmenu_con"]/div[1]/div[2]'
		);
		const heading = await headingHandle.evaluate((el) => el.innerHTML);

		const dates = await this.page.evaluate(() => {
			const headings = Array.from(
				document.querySelectorAll('div[class="h3_bold"]')
			);
			return headings.map((td) => td.innerHTML);
		});

		const lunchMenu = await this.page.evaluate(() => {
			const tables = Array.from(
				document.querySelectorAll('td[style="word-wrap: break-word"]')
			);
			return tables.map((td) => td.innerHTML);
		});

		// schoolsoft doesnt like wrapping the date and lunch menu into their own divs
		// so i have to iterate through each lunch menu and add the date and the lunch menu
		// into an object
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
	 * @returns {Promise<LunchMenu>} Returns the lunch menu and metadata in object form on success, returns string on failure
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
		if (!this.loggedIn) {
			throw new Error('User is not logged in');
		}

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
	 */
	public async getNews(): Promise<News | boolean> {
		if (!this.loggedIn) {
			throw new Error('User is not logged in');
		}

		await this.page.goto(`${this.baseURL}/student/right_student_news.jsp`);

		const content = await this.page.$x('//*[@id="news_con_content"]');
		const all = await content[0].evaluate((el) => {
			if (!el.hasChildNodes()) return [];

			const elements = Array.from(el.children);
			return elements.filter((element) => element.hasChildNodes());
		});

		if (!all.length) {
			return [];
		}

		// change when done
		return true;
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
