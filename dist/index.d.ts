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
 * The SchoolSoft class, everything is defined in here
 * @example <caption>CommonJS Require</caption>
 * const SchoolSoft = require('schoolsoft-scraper').default;
 * @example <caption>ES6 Import/TypeScript</caption>
 * import SchoolSoft from 'schoolsoft-scraper';
 */
export default class SchoolSoft {
    private loggedIn;
    private puppeteerOptions;
    private browser;
    private page;
    school: string;
    baseURL: string;
    /**
     * Initializes the SchoolSoft class
     * @param {string} school - The school being accessed
     * @param {string} path - The path to the chromium executable
     * @example <caption>CommonJS Require</caption>
     * const SchoolSoft = require('schoolsoft-scraper').default;
     * const school = new SchoolSoft('engelska', '/usr/bin/chromium-browser');
     * @example <caption>ES6 Import/TypeScript</caption>
     * import SchoolSoft from 'schoolsoft-scraper';
     * const school = new SchoolSoft('medborgarskolan', '/usr/bin/chromium-browser');
     */
    constructor(school: string, path: string);
    /**
     * Launches puppeteer with an incognito tab and opens a page
     * @async
     * @private
     * @returns {Promise<boolean>} Returns true on success, else false
     */
    private open;
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
    login(username: string, password: string): Promise<string>;
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
    private fetchLunchMenu;
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
    getLunchMenu(week?: number): Promise<LunchMenu>;
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
    getNews(): Promise<News | boolean>;
    /**
     * Closes the browser, this should only be called after you are done with your session
     * @async
     * @public
     * @returns {Promise<boolean>} Returns true on success
     * @example
     * school.close()
     * .catch(console.error);
     */
    close(): Promise<boolean>;
}
