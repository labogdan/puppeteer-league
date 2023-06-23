const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.azsoccerassociation.org/about/member-clubs/';
let OUTPUT_FILE = 'data/output/azsoccerassociation.csv';
let csvRecords = [];

let result = [];

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('#accordion', {timeout: 5000});
  let retVal = await page.evaluate(() => {    
    let returnValue = [''];
    
    document.querySelectorAll('.responsive-table td').forEach((item) => {
      returnValue.push(item.querySelector('a') ? item.querySelector('a').innerText : '');
      returnValue.push(',');
      returnValue.push(item.querySelector('a') ? item.querySelector('a').href : '');
      returnValue.push(',');
      returnValue.push(item.querySelectorAll('strong')[1] ? item.querySelectorAll('strong')[1].innerText.replace(/[\r\n\s]+/g, "") : '');
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
        console.log('done');
    } catch(e) {
        console.error('there was an error');
        console.error(e);
    }

    await page.close();
    await browser.close();
}

exports.azsoccerassociation = async (req, res, next) => {
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