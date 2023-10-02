const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.scyouthsoccer.com/Default.aspx?tabid=1384869';
let OUTPUT_FILE = 'data/output/scyouthsoccer.csv';
let csvRecords = [29044, 29572, 29401, 29601, 29501];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};


let result = [];

async function filloutAndClick(page, record) {
  await page.waitForSelector('div#locationFinder', {timeout: 15000});
  await page.$eval('input#zipCodeTextBox', (el, record) => {el.value = record}, record);
  await utils.wait(3000);
  await page.$eval('select#distanceDropdown', el => el.value = '50');
  await page.$eval('a#searchButton', el => el.click());
  await utils.wait(3000);
};

async function scrapePage(page, record) {
  console.log('scraping page');

  await page.waitForSelector('table#locationList', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let elems = document.querySelectorAll('table#locationList tr.list');
//console.log(elems);

    elems.forEach((elem) => {
      let data = elem.querySelectorAll('table tr td.top-align.text-left')[1].querySelectorAll('table tr');
      let title = data[0].querySelector('h4')?.innerText;
      let url = data[0].querySelector('a')?.href;
      let tags = data[1].querySelector('table td.content-text')?.innerText;
      let contact = data[4].querySelectorAll('.content-text div');
      let address = contact[0]?.innerText;
      let phone = contact[1]?.innerText;
      let email = contact[2]?.innerText;
      
      returnValue.push(record);
      returnValue.push(',');
      returnValue.push(title || ' ');
      returnValue.push(',');
      returnValue.push(url || ' ');
      returnValue.push(',');
      returnValue.push(tags || ' ');
      returnValue.push(',');
      returnValue.push(address?.replaceAll('\n',' ') || ' ');
      returnValue.push(',');
      returnValue.push(phone || ' ');
      returnValue.push(',');
      returnValue.push(email || ' '); 
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

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    try {
      for (let i = 0;i < csvRecords.length; i++) {
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

exports.scyouthsoccer = async (req, res, next) => {
    try {
        console.log('scyouthsoccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};