const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.wyomingsoccer.com/clubs/find-a-club-3/';
let OUTPUT_FILE = 'data/output/wyomingsoccer-urls.csv';
// let csvRecords = [83209, 83814, 83616];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('.responsive-table.theme01', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let elements = document.querySelectorAll('.responsive-table.theme01 tr td');
    elements.forEach( (element) => {
      let href = element.querySelector('td a')?.href;
      
      // returnValue.push(href);
      // returnValue.push(',');
      
      let data = element.querySelectorAll('td p span');
      data.forEach( (information) => {
          returnValue.push(information.innerText);
          returnValue.push(',');
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

exports.wyomingsoccer = async (req, res, next) => {
    try {
        console.log('wyomingsoccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};