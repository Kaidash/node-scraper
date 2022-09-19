import puppeteer from "puppeteer";

const { PUPPETEER_SKIP_CHROMIUM_DOWNLOAD } = process.env;

const startBrowser = async () => {
  try {
    const options = {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-gpu',
      ]
    }
    if (PUPPETEER_SKIP_CHROMIUM_DOWNLOAD) {
      options.headless = true;
      options.executablePath = '/usr/bin/chromium-browser';
    }
    console.log("Opening the browser......");
    const browser = await puppeteer.launch(options);
    return browser;
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
  }
};

export default startBrowser;
