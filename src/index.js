const puppeteer = require('puppeteer-core');

/**
 * The SchoolSoft class, everything is defined in here
 * @example <caption>CommonJS require</caption>
 * const SchoolSoft = require('schoolsoft-scraper');
 * @example <caption>ES6 Import</caption>
 * import SchoolSoft from 'schoolsoft-scraper';
 */
class SchoolSoft {
	/**
	 * @private
	 * @type {Boolean}
	 */
	#loggedIn = false;
	/**
	 * @private
	 * @type {puppeteer.LaunchOptions}
	 */
	#puppeteerOptions = {};
	/**
	 * @private
	 * @type {puppeteer.Browser|undefined}
	 */
	#browser = null;
	/**
	 * @private
	 * @type {puppeteer.Page|undefined}
	 */
	#page = null;

	/**
	 * Creates the SchoolSoft class with everything important
	 * @param {String} school - The school being accessed
	 * @param {String} path - The path to the chromium executable
	 * @example <caption>CommonJS require</caption>
	 * const SchoolSoft = require('schoolsoft-scraper');
	 * const school = new SchoolSoft('engelska', '/usr/bin/chromium-browser');
	 * @example <caption>ES6 Import</caption>
	 * import SchoolSoft from 'schoolsoft-scraper';
	 * const school = new SchoolSoft('medborgarskolan', '/usr/bin/chromium-browser');
	 */
	constructor(school, path) {
		/**
		 * @type {String}
		 */
		this.school = school;
		/**
		 * @type {String}
		 */
		this.baseURL = `https://sms14.schoolsoft.se/${school}/jsp`;
		this.#puppeteerOptions = {
			headless: true,
			executablePath: path
		};
	}

	/**
	 * Launches puppeteer with an incognito tab and opens a page
	 * @async
	 * @private
	 * @returns {Promise<Boolean>} Returns true when successfully opened, else returns false
	 * @example
	 * await this.#open()
	 * .catch(console.error);
	 */
	#open() {
		return new Promise(async (resolve, reject) => {
			try {
				this.#browser = await puppeteer.launch(this.#puppeteerOptions);
				const context = await this.#browser.createIncognitoBrowserContext();
				this.#page = await context.newPage();

				resolve(true);
			} catch (err) {
				reject(false);
			}
		});
	}

	/**
	 * Login to SchoolSoft
	 * @async
	 * @param {String} username - The username for the login
	 * @param {String} password - The password for the login
	 * @returns {Promise<String>} Returns the redirected URL on success
	 * @example <caption>Login with try/catch</caption>
	 * try {
	 * 	const url = await school.login('sample', 'text');
	 * 	console.log(url);
	 * } catch(err) {
	 * 	console.error(err);
	 * }
	 */
	login(username, password) {
		return new Promise(async (resolve, reject) => {
			try {
				if (typeof username !== 'string') {
					throw 'Username must be of type string';
				}
				if (typeof password !== 'string') {
					throw 'Password must be of type string';
				}

				await this.#open();
				await this.#page.goto(`${this.baseURL}/Login.jsp?usertype=1`);

				await this.#page.type('input#ssusername', username);
				await this.#page.type('input#sspassword', password);

				await this.#page.click('input[type="submit"]');
				await this.#page.waitForNavigation();

				const url = this.#page.url();

				if (url !== `${this.baseURL}/student/right_student_startpage.jsp`) {
					throw 'Invalid username or password';
				}

				this.#loggedIn = true;
				resolve(url);
			} catch (err) {
				reject(err);
			}
		});
	}

	/**
	 * @typedef {Object} LunchMenu
	 * @property {String} heading - The heading for the table, the h2 next to the plate cutlery icon
	 * @property {Object[]} menu - The list of meals, each element in the array is the day's lunch (mon-fri)
	 * @property {String} menu.title - The title for the lunch menu (date)
	 * @property {String} menu.lunch - The lunch for the date
	 */
	/**
	 * Fetches the menu
	 * @async
	 * @private
	 * @returns {Promise<LunchMenu>|Promise<String>} Returns the lunch menu on success, returns string on failure
	 * @example
	 * school.#fetchLunchMenu()
	 * .then(console.log)
	 * .catch(console.error)
	 */
	#fetchLunchMenu() {
		return new Promise(async (resolve, reject) => {
			try {
				const element = await this.#page.$x(
					'//*[@id="lunchmenu_con_content"]/table[1]'
				);
				if (!element.length) {
					throw 'No lunch menu exists for that week';
				}

				const [headingHandle] = await this.#page.$x(
					'//*[@id="lunchmenu_con"]/div[1]/div[2]'
				);
				const heading = await headingHandle.evaluate((el) => el.innerText);

				const dates = await this.#page.evaluate(() => {
					const headings = Array.from(
						document.querySelectorAll('div[class="h3_bold"]')
					);
					return headings.map((td) => td.innerHTML);
				});

				const lunchMenu = await this.#page.evaluate(() => {
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

				resolve({
					heading,
					menu
				});
			} catch (err) {
				reject(err);
			}
		});
	}

	/**
	 * Gets the lunch menu
	 * @async
	 * @param {Number} [week] - The week's lunch you want to get
	 * @returns {Promise<LunchMenu>|Promise<String>} Returns the lunch menu and metadata in object form on success, returns string on failure
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
	getLunchMenu(week) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!this.#loggedIn) {
					throw 'User is not logged in';
				}

				if (week) {
					if (!Number.isInteger(week)) {
						throw 'Week must be an integer';
					}

					await this.#page.goto(
						`${this.baseURL}/student/right_student_lunchmenu.jsp?requestid=${week}`
					);

					const menu = await this.#fetchLunchMenu();
					resolve(menu);
				} else {
					await this.#page.goto(
						`${this.baseURL}/student/right_student_lunchmenu.jsp`
					);

					const menu = await this.#fetchLunchMenu();
					resolve(menu);
				}
			} catch (err) {
				reject(err);
			}
		});
	}

	/**
	 * Gets the news
	 * @async
	 * @returns {Promise<Object>} Returns data about each news, split into categories
	 * @example
	 * school.getNews()
	 * .then(console.log)
	 * .catch(console.error)
	 */
	getNews() {
		return new Promise(async (resolve, reject) => {
			try {
				if (!this.#loggedIn) {
					throw 'User is not logged in';
				}

				await this.#page.goto(`${this.baseURL}/student/right_student_news.jsp`);

				const content = await this.#page.$x('//*[@id="news_con_content"]');
				const all = await content[0].evaluate((el) => {
					if (!el.hasChildNodes()) return [];

					const elements = Array.from(el.children);
					return elements.filter((element) => element.hasChildNodes());
				});

				if (!all.length) {
					throw 'No news available';
				}

				// change when done
				resolve(true);
			} catch (err) {
				reject(err);
			}
		});
	}

	/**
	 * Closes the browser, this should only be called after you are done with your session
	 * @async
	 * @returns {Promise<String>} Returns 'Successfully closed SchoolSoft' on browser close, or rejects with error
	 * @example
	 * await school.close()
	 * .catch(console.error);
	 */
	close() {
		return new Promise(async (resolve, reject) => {
			try {
				if (!this.#browser) {
					throw 'An instance of puppeteer has not been initiated, you may not close the browser';
				}

				await this.#browser.close();
				resolve('Successfully closed SchoolSoft');
			} catch (err) {
				reject(err);
			}
		});
	}
}

module.exports = SchoolSoft;
