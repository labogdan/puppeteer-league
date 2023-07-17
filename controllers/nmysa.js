const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'http://www.nmysa.net/bottom-nav/NMYSA_Members/nmysamembers.htm';
let OUTPUT_FILE = 'data/output/nmysa-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};


let result = [];

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('#content #col-left', {timeout: 15000});

  // await page.click('');
  
  let retVal = await page.evaluate(() => {    
    let returnValue = [''];
    let elems = document.querySelectorAll('#content #col-left table tr')
    for (let i = 0; i < elems.length; i++) {
      returnValue.push(elems[i].childNodes[3].querySelector('a') && elems[i].childNodes[3].querySelector('a').textContent);
      returnValue.push(',');
      returnValue.push(elems[i].childNodes[3].querySelector('a') && elems[i].childNodes[3].querySelector('a').href);
      returnValue.push('\n');
      returnValue.push(elems[i].childNodes[7].querySelector('p a') && elems[i].childNodes[7].querySelector('p a').textContent);
      returnValue.push(',');
      returnValue.push(elems[i].childNodes[7].querySelector('p a') && elems[i].childNodes[7].querySelector('p a').href);
      returnValue.push('\n');
    }
    return returnValue;
  }, wait) || {};
  console.log(retVal);
  return retVal;
}


async function init () {
    console.log('init');
    //await readData();
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: true,
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

exports.nmysa = async (req, res, next) => {
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