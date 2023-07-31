const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/exposureevents-urls-2.csv';
//let INPUT_URL = 'https://exposureevents.com/youth-events';
let OUTPUT_FILE = 'data/output/exposureevents-final-2.csv';
const records = [
/*  "Baseball",
  "Basketball",
  "Football",*/
  "Hockey",
  "Lacrosse",
  "Pickleball",
  "Soccer",
  "Softball",
  "Volleyball",
  "Water Polo",
  "Wrestling"
];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};


let result = [];

async function scrapePage(page, record, previous) {
  console.log('scraping page');

  await page.waitForSelector('a span[itemprop="name"]', {timeout: 15000});
  console.log('found results');

let retVal = await page.evaluate( async (previous) => {

    const removeWhitespaceAndNewlines = (input) => {
      return input.replace(/\s/g, "");
    }

    let returnValue = [''];

    let orgName = document.querySelectorAll('a span[itemprop="name"]')[3].innerText;
    let contact = document.querySelector('div[itemprop="performer"]').innerText.replaceAll('\n',', ')
    let additionalInfo = [];
    let urls = [];
    
    document.querySelector('div.col-12 .list-unstyled').querySelectorAll('li').forEach(item => {
        additionalInfo.push(removeWhitespaceAndNewlines(item.innerText).trim());
    });    
    document.querySelectorAll('.row-header a.fa-stack').forEach(item => {
        urls.push(item.href);
    });

    returnValue.push(previous.join(','));
    returnValue.push(',');
    returnValue.push(orgName);
    returnValue.push(',');
    returnValue.push(contact);
    returnValue.push(',');
    returnValue.push(additionalInfo.join(','));
    returnValue.push(',');
    returnValue.push(urls.join(','));
    returnValue.push('\n');

    console.log(returnValue);
    return returnValue;
  }, previous);

  console.log(retVal);
  return retVal;
}

async function init () {
    console.log('init');
    csvRecords = await utils.readData(INPUT_FILE);
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
        slowMo: 100
    });
    console.log('spawned browser');

    const page = await browser.newPage();
    console.log('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
          try { console.log(await msgArgs[i].jsonValue()); } catch (e) {}
        }
    });
    
    for (i = 0; i < csvRecords[0].length; i++) {
      let record = csvRecords[0][i][7];
      let previous = csvRecords[0][i];
      console.log(record);
      try {
        await page.goto(record, {waitUntil: 'domcontentloaded', timeout: 15000});
        let ret = await scrapePage(page, record, previous);
        console.log(ret.length);
        if (ret.length === 1) {
          break;
        }
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

exports.exposureEventsFinal = async (req, res, next) => {
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