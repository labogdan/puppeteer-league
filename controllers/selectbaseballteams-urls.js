const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://selectbaseballteams.com/travel-baseball-rankings';
let OUTPUT_FILE = 'data/output/selectbaseballteams-urls.csv';
let csvRecords = [];

let result = [];

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('.view-content', {timeout: 15000});
  let retVal = await page.evaluate(() => {    
    let returnValue = [''];

    let elem = document.querySelector('.view-content');
    elem.querySelectorAll('a').forEach((item, i) => {
      returnValue.push(i);
      returnValue.push(',');
      returnValue.push(item.href);
      returnValue.push('\n');
    });
    
    return returnValue;
  });
console.log(retVal);
  return retVal;
}


async function init () {
    console.log('init');
    //await readData();
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        slowMo: 300
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


exports.selectbaseballteamsUrls = async (req, res, next) => {
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