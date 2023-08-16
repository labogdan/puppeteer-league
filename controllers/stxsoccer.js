const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.stxsoccer.org/member-associations';
let OUTPUT_FILE = 'data/output/stxsoccer-urls.csv';
// let csvRecords = [83209, 83814, 83616];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function filloutAndClick(page) {
  console.log('filloutAndClick');
  await page.waitForSelector('a#searchButton', {timeout: 15000});  
  await page.$eval('a#searchButton', el => el.click());
  console.log('clicked search');
  await utils.wait(3000);
  console.log('waited');
};

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('.section', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [''];

    let top = document.querySelectorAll('.section')[1];
    let bottom = document.querySelectorAll('.section')[2];

    let topItems = top.querySelectorAll('.container .members-wrapper div[role="listitem"]');
    let bottomItems = bottom.querySelectorAll('.container .members-wrapper div[role="listitem"]');


    topItems.forEach((row) => {
        let item = row.querySelectorAll('.w-embed');
        returnValue.push(item[0]?.querySelector('a')?.textContent || item[0].querySelector('p')?.textContent || item[0].textContent || '');
        returnValue.push(',');
        returnValue.push(item[0]?.querySelector('a')?.href || '');
        returnValue.push(',');
        returnValue.push(item[0]?.nextSibling.innerText || '');
        returnValue.push(',');
        returnValue.push(item[1]?.textContent?.split(':')[1] || '');
        returnValue.push(',');
        returnValue.push(item[2]?.querySelector('a')?.textContent || '');
        returnValue.push(',');
        returnValue.push(item[3]?.textContent?.split(':')[1] || '');
        returnValue.push('\n');
    });
    
    bottomItems.forEach((row) => {
        let item = row.querySelectorAll('.w-embed');
        returnValue.push(item[0]?.querySelector('a')?.textContent || item[0].querySelector('p')?.textContent || item[0].textContent || '');
        returnValue.push(',');
        returnValue.push(item[0]?.querySelector('a')?.href || '');
        returnValue.push(',');
        returnValue.push(item[0]?.nextSibling.innerText || '');
        returnValue.push(',');
        returnValue.push(item[1]?.textContent?.split(':')[1] || '');
        returnValue.push(',');
        returnValue.push(item[2]?.querySelector('a')?.textContent || '');
        returnValue.push(',');
        returnValue.push(item[3]?.textContent?.split(':')[1] || '');
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

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    try {
      // await filloutAndClick(page);
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

exports.stxsoccer = async (req, res, next) => {
    try {
        console.log('stxsoccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};