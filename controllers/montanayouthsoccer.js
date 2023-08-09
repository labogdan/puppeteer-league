const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.montanayouthsoccer.com/about/memberclubs/';
let OUTPUT_FILE = 'data/output/montanayouthsoccer-urls.csv';
// let csvRecords = [83209, 83814, 83616];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('.site-section.main', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let elements = document.querySelectorAll('.site-section.main .data-table tbody tr');
    elements.forEach( (element) => {
        let name = '';
        let href = '';
        let city = '';

        name = element.querySelector('td a')?.innerText;
        href = element.querySelector('td a')?.href;
        city = element.querySelectorAll('td')[1]?.innerText;
        
        returnValue.push(name);
        returnValue.push(',');
        returnValue.push(href);
        returnValue.push(',');
        returnValue.push(city);
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

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    try {
      let ret = await scrapePage(page);
      let csv = ret.join();
      fs.appendFileSync(OUTPUT_FILE, csv);
    } catch(e) {
      console.error('there was an error');
      console.error(e);
    }
    await page.close();
    await browser.close();
}

exports.montanayouthsoccer = async (req, res, next) => {
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