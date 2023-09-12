const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/floridayouthsoccer-urls.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/floridayouthsoccer-clubs.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, record, previous) {
  console.log('scraping page');

  await page.waitForSelector('.location-info table tr td', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (previous) => {
    let returnValue = [''];
    let elems = document.querySelectorAll('.location-info table tr td');
    returnValue.push(previous);
    returnValue.push(',');
    returnValue.push(elems[0]?.querySelector('a')?.href || '');
    returnValue.push(',');
    returnValue.push(elems[1]?.innerText || '');
    returnValue.push('\n');
    return returnValue;
  
  }, previous);

  console.log(retVal);
  return retVal;
}

async function init () {
    console.log('init');
    csvRecords = await utils.readData(INPUT_FILE);
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        slowMo: 100
    });
    console.log('spawned browser');

    const page = await browser.newPage();
    console.log('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        try {console.log(await msgArgs[i].jsonValue());} catch (e) {}
        }
    });

    for (i = 0; i < csvRecords[0].length; i++) {
      console.log('********' + csvRecords[0][i].length + '********');
      let record = csvRecords[0][i][csvRecords[0][i].length - 2];
      let previous = csvRecords[0][i];
      console.log(record);
      console.log(previous);
      try {
        await page.goto(record, {waitUntil: 'domcontentloaded', timeout: 15000});
        let ret = await scrapePage(page, record, previous);
        console.log(ret.length);
        if (ret.length === 1) {
          break;
        }
        let csv = ret.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
      } catch(e) {
          console.error('there was an error');
          console.error(e);
      }
    }

    await page.close();
    await browser.close();
}

exports.floridayouthsoccer = async (req, res, next) => {
    try {
        console.log('floridayouthsoccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};