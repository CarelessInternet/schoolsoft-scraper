<div align="center">
   <img src="https://shields.io/npm/v/schoolsoft-scraper?color=darkgreen">
   <img src="https://shields.io/npm/l/schoolsoft-scraper">
   <img src="https://shields.io/node/v/schoolsoft-scraper">
   <img src="https://shields.io/github/languages/top/CarelessInternet/schoolsoft-scraper">
   <img src="https://shields.io/npm/types/schoolsoft-scraper">
   <img src="https://shields.io/github/commit-activity/m/CarelessInternet/schoolsoft-scraper/typescript?color=orange">
   <img src="https://shields.io/npm/dw/schoolsoft-scraper">
   <img src="https://shields.io/github/issues/CarelessInternet/schoolsoft-scraper">
   <img src="https://shields.io/github/issues-pr/CarelessInternet/schoolsoft-scraper">
</div>

# ATTENTION!

This dependency is deprecated, please use [this one instead](https://www.npmjs.com/package/schoolsoft) for 100x faster results

# schoolsoft-scraper

## Attention!

This scraper is only compatible with student accounts! You cannot use staff or guardian accounts with this scraper.

## Backstory

I decided to look for the SchoolSoft API to implement my own version of SchoolSoft, however I was disappointed to find out that
SchoolSoft has no official public API. In the website, they said they have an API package, however there is no way to publicly access it.
The only solution was to create my own scraper using `puppeteer`/`puppeteer-core` to extract information and create my own version of SchoolSoft.

## Documentation

Documentation can be found in the [wiki section](https://github.com/CarelessInternet/schoolsoft-scraper/wiki) of the [GitHub repository](https://github.com/CarelessInternet/schoolsoft-scraper).

## Install

Install by running `npm i schoolsoft-scraper` or `npm install schoolsoft-scraper`.
Please make sure your chromium executable is up to date as well.

## Testing

Testing is implemented with `jest`, you will have to manually test to see if everything works correctly.

#### Testing by Yourself

1. Create a `.env` file with the following environment variables:
   - SCHOOLSOFT_SCHOOL
   - SCHOOLSOFT_USERNAME
   - SCHOOLSOFT_PASSWORD
   - CHROMIUM_PATH (default is `/usr/bin/chromium-browser`)
2. Run the tests by running `npm test`.

## Issues & Pull Requests

Feel free to submit an issue or pull request for whatever reason you like: questions, bugs, fixes, feature requests, etc. You may use either English or Swedish.
