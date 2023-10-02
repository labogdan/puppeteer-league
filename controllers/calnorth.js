const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.calnorth.org/find-a-league#googtrans(en|)';
let OUTPUT_FILE = 'data/output/calnorth-urls.csv';
let csvRecords = ['San Jose'];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};


let result = [];

async function filloutAndClick(page, record) {
  await page.waitForSelector('.bh-sl-form-container', {timeout: 15000});
  await page.$eval('input#bh-sl-address', (el, record) => {el.value = record}, record);
  await page.$eval('select#bh-sl-maxdistance', el => el.value = '250');
  await page.$eval('button#bh-sl-submit', el => el.click());
  
  await utils.wait(3000);
};

async function scrapePage(page, record) {
  console.log('scraping page');

  await page.waitForSelector('.bh-sl-loc-list', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let elems = document.querySelectorAll('.bh-sl-loc-list ul li');
    
    elems.forEach(elem => {
      let name = elem.querySelector('.info-top h4.loc-title')?.innerText;
      let address = elem.querySelector('.loc-address')?.innerText.replaceAll('\n',' ');
      let url = elem.querySelector('a')?.href;
      returnValue.push(name);
      returnValue.push(',');
      returnValue.push(address);
      returnValue.push(',');
      returnValue.push(url);
      returnValue.push('\n');
    });

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

exports.calnorth = async (req, res, next) => {
    try {
        console.log('calnorth');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};