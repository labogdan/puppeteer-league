const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/input/tnsoccer-input.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/tnsoccer-urls.csv';
// let csvRecords = [83209, 83814, 83616];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, record) {
  console.log('scraping page');

  await page.waitForSelector('.sqs-block-content .sqs-html-content', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let clubs = document.querySelector('.sqs-block-content .sqs-html-content');
    let data = clubs.querySelectorAll('a');

    returnValue.push(record);
    returnValue.push(',');

    data.forEach((data, i) => {
        returnValue.push(data.textContent);
        returnValue.push(',');
        returnValue.push(data.href);
        if ((i+1) % 2 === 0) { 
          returnValue.push('\n');
        }
        
    });
    
    return returnValue;
  }, record);

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
      let record = csvRecords[0][i][0];
      
      await page.goto(record, {waitUntil: 'domcontentloaded', timeout: 15000});
    
      try {
        let ret = await scrapePage(page, record);
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

exports.tnsoccer = async (req, res, next) => {
    try {
        console.log('tnsoccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};