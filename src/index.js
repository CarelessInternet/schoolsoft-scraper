const puppeteer = require('puppeteer-core');

/**
 * The SchoolSoft class, everything is performed in here
 */
class SchoolSoft {
	/**
	 * @type {Boolean}
	 */
	#loggedIn = false;
	/**
	 * @type {puppeteer.LaunchOptions}
	 */
	#puppeteerOptions = {};
	/**
	 * @type {puppeteer.Browser|undefined}
	 */
	#browser = null;
	/**
	 * @type {puppeteer.Page|undefined}
	 */
	#page = null;

	/**
	 * Creates the SchoolSoft class with everything important
	 * @param {String} school - The school being accessed
	 * @param {String} [path] - The path for the chromium executable
	 */
	constructor(school, path = '') {
		this.school = school;
		this.baseURL = `https://sms14.schoolsoft.se/${school}/jsp`;
		this.#puppeteerOptions = {
			headless: true,
			...(path && { executablePath: path })
		};
	}

	/**
	 * Launches puppeteer and opens a page
	 * @async
	 * @returns {Promise<Boolean>|Promise<String>} Returns the browser and page instance
	 */
	#open() {
		return new Promise(async (resolve, reject) => {
			try {
				const browser = await puppeteer.launch(this.#puppeteerOptions);
				const page = await browser.newPage();

				this.#browser = browser;
				this.#page = page;
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
	 * @param {{0, 1, 2}} [userType] - The type of user requesting the login, default is 1 for student, 0 for staff, and 2 for guardians
	 * @returns {(Promise<Boolean>|Promise<String>)} Returns the initial fetch request to the login page on success
	 */
	login(username, password, userType = 1) {
		return new Promise(async (resolve, reject) => {
			if (typeof username !== 'string') {
				reject('Username must be of type string');
			}
			if (typeof password !== 'string') {
				reject('Password must be of type string');
			}
			if (typeof userType !== 'number') {
				reject('The user type must be a number');
			}

			try {
				await this.#open();
				await this.#page.goto(`${this.baseURL}/Login.jsp?usertype=${userType}`);

				await this.#page.type('input#ssusername', username);
				await this.#page.type('input#sspassword', password);

				await this.#page.click('input[type="submit"]');
				await this.#page.waitForNavigation();

				const url = this.#page.url();

				if (url !== `${this.baseURL}/student/right_student_startpage.jsp`) {
					reject('Invalid username or password');
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
	 * @returns {Promise<String>} Returns the lunch menu
	 */
	getLunchMenu() {
		return new Promise(async (resolve, reject) => {
			try {
				if (!this.#loggedIn) {
					reject('User is not logged in');
				}

				await this.#page.goto(
					`${this.baseURL}/student/right_student_lunchmenu.jsp`
				);

				const [headingHandle] = await this.#page.$x(
					'//*[@id="lunchmenu_con"]/div[1]/div[2]'
				);
				const heading = await headingHandle.evaluate((el) => el.innerText);

				resolve(heading);
			} catch (err) {
				reject(err);
			}
		});
	}

	/**
	 * Closes the browser, this should only be called after you are done with your session
	 * @async
	 * @returns {Promise<Boolean>|Promise<String>} Returns success on browser close, or rejects with error
	 */
	close() {
		return new Promise(async (resolve, reject) => {
			try {
				if (!this.#browser) {
					reject(
						'An instance of puppeteer has not been initiated, you may not close the browser'
					);
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
