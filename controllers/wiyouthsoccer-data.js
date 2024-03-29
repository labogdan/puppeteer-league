const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/wiyouthsoccer-urls.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/wiyouthsoccer-data.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, record, previous) {
  console.log('scraping page');

  await page.waitForSelector('table.MainContent', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (previous) => {
    let returnValue = [];
    let elements = document.querySelectorAll('#cb-list-tbl-1 tr td');
    
    returnValue.push(previous);

    let website = document.querySelector('#cb-links-tbl-1')?.querySelector('a')?.href || '';
    let contactInfo = document.querySelectorAll('#cb-cont-tbl-1 tr')[0];

    let role = contactInfo.querySelector('.cb-cont-role')?.innerText || '';
    let name = contactInfo.querySelector('.cb-cont-name')?.innerText || '';
    let email = contactInfo.querySelector('.cb-cont-email')?.innerText || '';
    let phones = contactInfo.querySelector('.cb-cont-phones')?.innerText || '';

    returnValue.push(website);
    returnValue.push(role);
    returnValue.push(name);
    returnValue.push(email);
    returnValue.push(phones);
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
        headless: true,
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
      let record = csvRecords[0][i][2];
      let previous = csvRecords[0][i];
      try {
        await page.goto(record, {waitUntil: 'domcontentloaded', timeout: 15000});
        let ret = await scrapePage(page, record, previous);
        console.log(ret.length);
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

exports.wiyouthsoccer = async (req, res, next) => {
    try {
        console.log('wiyouthsoccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};