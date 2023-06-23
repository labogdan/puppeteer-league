const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://washingtonyouthsoccer.org/find-a-club/';
let OUTPUT_FILE = 'data/output/washingtonyouthsoccer.csv';
let csvRecords = [];

let result = [];

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('#filter_left_panel', {timeout: 5000});
  let retVal = await page.evaluate(() => {    
    let returnValue = [''];
    document.querySelectorAll('#storeLocator__storeListRow .medium-4.ssf-column.ssf-column_custom').forEach( (club) => {
      returnValue.push(club.querySelector('.club-card__details a').innerText);
      returnValue.push(',');
      returnValue.push(club.querySelector('.club-card__details a').href);
      returnValue.push(',');
      returnValue.push(club.querySelector('.infobox__row.store-address').innerText.split(/\s(.*)/s)[1]);
      
      club.querySelectorAll('.club-card__pill').forEach((item) => {
        returnValue.push(',');
        returnValue.push(item.innerText);
      });
      returnValue.push('\n');
    });
    return returnValue;
  });
  console.log(retVal);
  return retVal;
}

async function init () {
    console.log('init');
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
        slowMo: 200
    });
    console.log('spawned browser');

    const page = await browser.newPage();
    console.log('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
        }
    });

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    try {
        let ret = await scrapePage(page);
        result.push(ret);
        let csv = result.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
        result = [];
        utils.wait(2000);
    } catch(e) {
        console.error('there was an error');
        console.error(e);
    }

    await page.close();
    await browser.close();
}

exports.washingtonyouthsoccer = async (req, res, next) => {
    try {
        console.log('perfectgameUrls');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};