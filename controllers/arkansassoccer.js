const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.arkansassoccer.org/';
let OUTPUT_FILE = 'data/output/arkansassoccer-urls.csv';
let csvRecords = [72701, 72401, 72002, 71854];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};


let result = [];

async function filloutAndClick(page, record) {
  await page.waitForSelector('#CT_ColumnCenter_0_txtLocation', {timeout: 15000});
  await page.$eval('#CT_ColumnCenter_0_txtLocation', (el, record) => {el.value = record}, record);
  await page.$eval('#CT_ColumnCenter_0_drpMiles', el => el.value = '100');
  await page.$eval('#CT_ColumnCenter_0_btnFindClub', el => el.click());
  await utils.wait(3000);
};

async function scrapePage(page, record) {
  console.log('scraping page');

  await page.waitForSelector('#CT_Main_0_pnlResults', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let elems = document.querySelectorAll('#CT_Main_0_pnlResults .content .location-item');
    elems.forEach(elem => {
      let el = elem.querySelector('.location-item-text');
      let name = el.innerText.split('\n')[0];
      let address = el.innerText.split('\n')[1] + ' ' + el.innerText.split('\n')[2];
      let url = el.querySelector('a.more').href;
      returnValue.push(record);
      returnValue.push(',');
      returnValue.push(name);
      returnValue.push(',');
      returnValue.push(address);
      returnValue.push(',');
      returnValue.push(url);
      returnValue.push('\n');
    });
    //console.log(returnValue);
    //await utils.wait(3000);
    return returnValue;
  
  }, record);

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

    
    
    try {
      for (let i = 0;i < csvRecords.length; i++) {
        await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
        await filloutAndClick(page, csvRecords[i]);
        let ret = await scrapePage(page, csvRecords[i]);
        let csv = ret.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
      }
    } catch(e) {
        console.error('there was an error');
        console.error(e);
    }
    await page.close();
    await browser.close();
}

exports.arkansassoccer = async (req, res, next) => {
    try {
        console.log('arkansassoccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};