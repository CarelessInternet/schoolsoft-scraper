# schoolsoft-scraper

## Backstory

I decided to look for the SchoolSoft API to implement my own version of SchoolSoft, however I was disappointed to find out that
SchoolSoft has no official public API. In the website, they said they have an API package, however there is no way to publicly access it.
The only solution was to create my own scraper using `puppeteer`/`puppeteer-core` to extract information and create my own version of SchoolSoft.

## Install

Install by running `npm i schoolsoft-scraper` or `npm install schoolsoft-scraper`.

## Testing

Testing is implemented with `jest`, and GitHub Actions should hopefully implement continuous integration to make sure everything works correctly.

#### Testing by Yourself

1. Create a `.env` file with the following environment variables:
   - SCHOOLSOFT_SCHOOL
   - SCHOOLSOFT_USERNAME
   - SCHOOLSOFT_PASSWORD
   - CHROMIUM_PATH
2. Run the tests by running `npm test`.

## Issues & Pull Requests

Feel free to submit an issue or pull request for whatever reason you like: questions, bugs, fixes, feature requests, etc. You may use either English or Swedish.
