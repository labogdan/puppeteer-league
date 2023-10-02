const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.google.com/maps/d/u/0/embed?mid=1XP_u-ZpHdZHHLkIFX3JgTKOB9IlhxsA&ehbc=2E312F&ll=38.549866679318214%2C-92.14274294999998&z=8';
let OUTPUT_FILE = 'data/output/missourisoccer-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};


let result = [];

async function filloutAndClick(page, record) {
  //await page.waitForSelector('.bh-sl-form-container', {timeout: 15000});
  //await page.$eval('input#bh-sl-address', (el, record) => {el.value = record}, record);
  //await page.$eval('select#bh-sl-maxdistance', el => el.value = '250');
  try {
    await record.click();
  } catch(e) {}
  await utils.wait(500);
};

async function scrapePage(page, record) {
  console.log('scraping page');

  await page.waitForSelector('#featurecardPanel', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let info = document.querySelectorAll('#featurecardPanel div.qqvbed-p83tee');
    
    let name = info[0].querySelectorAll('div')[1]?.innerText;
    let district = info[1].querySelectorAll('div')[1]?.innerText;
    let url = info[2].querySelector('a')?.href;
    let address = info[3].querySelectorAll('div')[1]?.innerText;
    let state = info[4].querySelectorAll('div')[1]?.innerText;
    let city = info[5].querySelectorAll('div')[1]?.innerText;
    let zip = info[6].querySelectorAll('div')[1]?.innerText;

    returnValue.push(record);
    returnValue.push(',');
    returnValue.push(name);
    returnValue.push(',');
    returnValue.push(district);
    returnValue.push(',');
    returnValue.push(url);
    returnValue.push(',');
    returnValue.push(address);
    returnValue.push(',');
    returnValue.push(city);
    returnValue.push(',');
    returnValue.push(state);
    returnValue.push(',');
    returnValue.push(zip);
    returnValue.push('\n');
    
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

    try {
      await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
      console.log('loaded page');
      csvRecords = await page.$$('div[role="button"]:not([class])');
      console.log('found records');
      console.log(csvRecords.length);
      for (let i = 0;i < csvRecords.length; i++) {
        console.log(i);
        console.log(csvRecords[i]);
        await filloutAndClick(page, csvRecords[i]);
        wait(200);
        let ret = await scrapePage(page, i);
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

exports.missourisoccer = async (req, res, next) => {
    try {
        console.log('missourisoccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};