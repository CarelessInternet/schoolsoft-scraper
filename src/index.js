const puppeteer = require('puppeteer-core');

/**
 * The SchoolSoft class, everything is performed in here
 * @example <caption>CommonJS</caption>
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
	 * @param {String} [path] - The puppeteer path for the chromium executable
	 * @example <caption>Without chromium path</caption>
	 * const SchoolSoft = require('schoolsoft-scraper');
	 * const school = new SchoolSoft('gotland');
	 * @example <caption>With chromium path</caption>
	 * const SchoolSoft = require('schoolsoft-scraper');
	 * const school = new SchoolSoft('engelska', '/usr/bin/chromium-browser');
	 * @example <caption>ES6 Import</caption>
	 * import SchoolSoft from 'schoolsoft-scraper';
	 * const school = new SchoolSoft('medborgarskolan');
	 */
	constructor(school, path = '') {
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
			...(path && { executablePath: path })
		};
	}

	/**
	 * Launches puppeteer with an incognito tab and opens a page
	 * @async
	 * @private
	 * @returns {Promise<Boolean>|Promise<String>} Returns the browser and page instance
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
				reject(err);
			}
		});
	}

	/**
	 * Login to SchoolSoft
	 * @async
	 * @param {String} username - The username for the login
	 * @param {String} password - The password for the login
	 * @returns {(Promise<Boolean>|Promise<String>)} Returns the initial fetch request to the login page on success
	 * @example
	 * try {
	 * 	await school.login('sample', 'text');
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
				resolve(true);
			} catch (err) {
				reject(err);
			}
		});
	}

	/**
	 * Gets the lunch menu
	 * @async
	 * @returns {Promise<Object>} Returns the lunch menu in object form
	 * @example
	 * school.getLunchMenu()
	 * .then(console.log)
	 * .catch(console.error);
	 */
	getLunchMenu() {
		return new Promise(async (resolve, reject) => {
			try {
				if (!this.#loggedIn) {
					throw 'User is not logged in';
				}

				await this.#page.goto(
					`${this.baseURL}/student/right_student_lunchmenu.jsp`
				);

				const [headingHandle] = await this.#page.$x(
					'//*[@id="lunchmenu_con"]/div[1]/div[2]'
				);
				const heading = await headingHandle.evaluate((el) => el.innerText);

				resolve({ heading });
			} catch (err) {
				reject(err);
			}
		});
	}

	/**
	 * Closes the browser, this should only be called after you are done with your session
	 * @async
	 * @returns {Promise<Boolean>|Promise<String>} Returns true on browser close, or rejects with error
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
				resolve(true);
			} catch (err) {
				reject(err);
			}
		});
	}
}

module.exports = SchoolSoft;
