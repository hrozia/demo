// Axios - Promise based HTTP client for the browser and node.js (Read more at https://axios-http.com/docs/intro).
import axios from 'axios';
// Cheerio - The fast, flexible & elegant library for parsing and manipulating HTML and XML (Read more at https://cheerio.js.org/).
import * as cheerio from 'cheerio';
// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { Actor } from 'apify';

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init().
await Actor.init();

interface Input {
    url: string;
}

// Structure of input is defined in input_schema.json
const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');
const { url } = input;

// Fetch the HTML content of the page.
const response = await axios.get(url);

// Parse the downloaded HTML with Cheerio to enable data extraction.
const $ = cheerio.load(response.data);

// Extract all headings from the page (tag name and text).
const headings: { level: string, text: string }[] = [];
$('p').each((_i, element) => {
    const headingObject = {
        level: $(element).prop('tagName')!.toLowerCase(),
        text: $(element).text(),
    };
    console.log('Extracted heading', headingObject);
    headings.push(headingObject);
});

// Save headings to Dataset - a table-like storage.
await Actor.pushData(headings);

await axios.post('https://api.apify.com/v2/acts/nazarii.hrozia~kroger-review/runs?token=apify_api_y264xcvLUyUA68dN6JLw2rLYYuVWa53HREg4',
    {
        "maxReviewsPerProduct": 30,
        "productUrlsOrUpcsReviews": [
            "https://www.kroger.com/p/fresh-banana-single/0000000004011?fulfillment=PICKUP"
        ]
    });
// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
