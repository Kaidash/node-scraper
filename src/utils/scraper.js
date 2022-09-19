import { load } from "cheerio";
import _chunk from "lodash/chunk.js";
import _uniqBy from "lodash/uniqBy.js";
import _get from "lodash/get.js";

import startBrowser from "./browser.js";

import Restaurants from "../models/restaurants.js";
import MenuItems from "../models/menuItems.js";

import Spreadsheets from "../services/spreadsheets.js";

const cities = ["cze/brno", "cze/prague", "cze/pilsen"];
const woltUrl = "https://wolt.com";
// number of parallel open restaurant details tabs in the browser
const PARALLEL_TAB_VALUE = 4;

// Auto scroll function for uploading lazy loading items
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        // eslint-disable-next-line no-undef
        const { scrollHeight } = document.body;
        // eslint-disable-next-line no-undef
        window.scrollBy(0, distance);
        totalHeight += distance;
        // eslint-disable-next-line no-undef
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

const initPage = async (browser, url, isScroll) => {
  const page = await browser.newPage();
  await page.goto(url);
  if (isScroll) {
    await autoScroll(page);
  }
  const data = await page.content();
  const content = load(data);
  return {
    content,
    page,
  };
};

const getDataFromDetailsPage = (content) => {
  const name = content("[class*='VenueHeroBanner__TitleSpan']").text();
  const addressBlock = content("[class*='VenueSideInfo-module__venueAddress']");
  const address = addressBlock
    .find("[class*='VenueSideInfo-module__primary']")
    .text();
  const cityWithPostcode = addressBlock
    .find("[class*='VenueSideInfo-module__secondary']")
    .text()
    .split(" ");
  const city = cityWithPostcode[cityWithPostcode.length - 1];
  const categories = content("[class*='RelatedCategories__StyledLink']")
    .get()
    .map((item) => content(item).text());
  const tel = content("[class*='AllergyInfo-module__phone'] > a > span").text();
  const menuItems = content("[class*='MenuItem-module__content']")
    .get()
    .map((menuItem) => {
      const title = content(menuItem)
        .find("[class*='MenuItem-module__name']")
        .text();
      const descr = content(menuItem)
        .find("[class*='MenuItem-module__description']")
        .text();
      const price = content(menuItem)
        .find("[class*='MenuItemPresentational__Value']")
        .text();
      const img = content(menuItem)
        .find("[class*='ImageWithBlurHashTransition__StyledImage']")
        .attr("src");
      return {
        title,
        descr,
        price,
        img,
      };
    });
  return {
    restaurantData: {
      name,
      address,
      city,
      categories,
      tel,
    },
    menuItems: _uniqBy(menuItems, "title"),
  };
};

const putParsedDataToDb = async (restaurantData, menuItems) => {
  const resDb = await Restaurants.insertRestaurant(restaurantData);

  if (resDb && resDb.insertedId) {
    await MenuItems.insertMenuItems(menuItems, resDb.insertedId);
  } else {
    throw new Error(`Can not save restaurant ${restaurantData.title}`);
  }

  return resDb;
};

const openRestaurantDetails = async (browser, url) => {
  try {
    console.log(`Running ${url} details page!`);
    const { content, page } = await initPage(browser, url, true);
    try {
      const { restaurantData, menuItems } = getDataFromDetailsPage(content);

      const dbDataAfterSave = await putParsedDataToDb(
        restaurantData,
        menuItems
      );

      const restaurantId = _get(dbDataAfterSave, "insertedId").toString();

      await Spreadsheets.addDataToSpreadsheetByIndex(
        [
          {
            ...restaurantData,
            categories: restaurantData.categories.join(),
          },
        ],
        0
      );
      await Spreadsheets.addDataToSpreadsheetByIndex(
        menuItems.map((item) => ({ restaurantId, ...item })),
        1
      );

      await page.close();
    } catch (e) {
      console.log(e);
      await page.close();
    }
  } catch (e) {
    console.log(e, "initPageErr");
  }
};
const parseDataForOneRestaurant = async (browser, url) => {
  try {
    console.log(`Running ${url} page!`);
    const { content, page } = await initPage(browser, url, true);
    try {
      console.log(`Opened ${url} page!`);

      const detailsRequests = [];

      await content("[class*='DiscoveryVenueListItem']")
        .get()
        .forEach((restaurant) => {
          const linkToRestaurant = content(restaurant).attr("href");
          const restaurantDetailsUrl = `${woltUrl}${linkToRestaurant}`;

          detailsRequests.push({
            restaurantDetailsUrl,
          });
        });

      const chunkedData = _chunk(detailsRequests, PARALLEL_TAB_VALUE);

      // prepare chunks for restaurants details
      const chunkedRequests = chunkedData.map((chunk) => async () => {
        await Promise.all(
          chunk.map(({ restaurantDetailsUrl }) =>
            openRestaurantDetails(browser, restaurantDetailsUrl)
          )
        );
      });

      // async forEach for every chunk
      await chunkedRequests.reduce(
        (promise, currPromise) => promise.then((val) => currPromise(val)),
        Promise.resolve()
      );

      await page.close();
    } catch (error) {
      console.error(error);
      await page.close();
    }
  } catch (e) {
    console.log(e);
  }
};
export default async () => {
  try {
    const browser = await startBrowser();
    // create restaurants tabs queue
    const requests = cities.map((url) => async () => {
      await parseDataForOneRestaurant(
        browser,
        `${woltUrl}/en/${url}/restaurants`
      );
    });
    // Drop collections and clear spreadsheet before new parsing
    await Promise.all([
      await Restaurants.clearRestaurants(),
      await MenuItems.clearMenuItems(),
      await Spreadsheets.clearSheet(),
    ]);

    // run restaurants queue
    await requests.reduce(
      (promise, currPromise) => promise.then((val) => currPromise(val)),
      Promise.resolve()
    );
    console.log('Parsing was finished!!!!!')
    await browser.close();
  } catch (error) {
    console.error(error);
  }
};
