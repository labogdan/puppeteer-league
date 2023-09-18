const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://nevadayouthsoccer.org/find-a-club/';
let OUTPUT_FILE = 'data/output/nevadayouthsoccer.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, record) {
  console.log('scraping page');

  await page.waitForSelector('.wp-block-group__inner-container .single-club', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let elems = document.querySelectorAll('.wp-block-group.margin-top-s.is-layout-constrained.wp-block-group-is-layout-constrained .wp-block-group__inner-container .single-club');
    
    elems.forEach((element) => {
      let title = element.querySelector('h3').innerText;
      returnValue.push(title || '');
      returnValue.push(',');
      let properties = element.querySelectorAll('h4');
      for (let i = properties.length - 1; i >= 0; i--) {
          if (i === properties.length - 1) {
            returnValue.push(properties[i]?.querySelector('a')?.href);
            returnValue.push(',');
          } else {
            if (properties[i]?.innerText.indexOf('ADDRESS') !== -1) {
              returnValue.push(properties[i]?.innerText.replaceAll(',', ' '));
            } else {
              returnValue.push(properties[i]?.innerText);
            }
            
            returnValue.push(',');
          }
      }
      if (properties.length < 4) {
        returnValue.push('PHONE: none');
        returnValue.push(',');
      }
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
        await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
        console.log('goto');
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

exports.nevadayouthsoccer = async (req, res, next) => {
    try {
        console.log('nevadayouthsoccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};