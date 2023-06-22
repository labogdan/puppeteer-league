const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/prepbaseballreport-step1.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/prepbaseballreport-step2.csv';
let csvRecords = [];

async function readData() {
  const readStream = fs.readFileSync(INPUT_FILE, {
    encoding: 'utf8',
  });
  
  csvRecords.push(
    readStream.split(/\r?\n/).map((line) => {
        return line.split(',');
    })
  );  
}

function inputURL(eventId) {
  return `https://tournaments.prepbaseballreport.com/events/${eventId}`
}

let result = [];

async function setUpPage(page, record) {

}

async function scrapePage(page, previousValue) {
  console.log('scraping page');
  
  try {
    await page.waitForSelector('.card.flat-card .card-links.social-link', {timeout: 5000});
    let retVal = await page.evaluate((previousValue) => {    
      console.log('evaluating page');
      let returnValue = [];
  
      returnValue.push(previousValue);
      returnValue.push(',');
      document.querySelectorAll('.card.flat-card .card-links.social-link li a').forEach((item) => {
        console.log('found element');
        returnValue.push(item.href);
        returnValue.push(',');
      });

      if (document.querySelectorAll('.card.flat-card .card-links.social-link li a').length === 2) {
        returnValue.push(',');
        returnValue.push(',');
      }

      if (document.querySelectorAll('.card.flat-card .card-links.social-link li a').length === 3) {
        returnValue.push('');
      }
      
      return returnValue;
    }, previousValue);
    console.log(retVal);
    return retVal;
  } catch(e) {
    let retVal = [];
    retVal.push(previousValue);
    retVal.push(',');
    retVal.push(',');
    retVal.push(',');
    retVal.push(',');
    retVal.push(',');
    retVal.push(',');
    return retVal;
  }

  
}

async function init () {
    console.log('init');
    await readData();
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
    });
    console.log('spawned browser');

    const page = await browser.newPage();
    console.log('spawned new page');
    await page.setViewport({
      width: 2000,
      height: 1000,
      deviceScaleFactor: 1,
    });

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
        }
    });

    for (i = 0; i < csvRecords[0].length; i++) {
      console.log(csvRecords[0][i][csvRecords[0][i].length - 2]);
      try {
        eventId = csvRecords[0][i][csvRecords[0][i].length - 2];
        await page.goto(inputURL(csvRecords[0][i][csvRecords[0][i].length - 2]), {waitUntil: 'domcontentloaded', timeout: 15000});
        let ret = await scrapePage(page, csvRecords[0][i]);

        result.push('');
        result.push(ret);
        result.push('\n');

        // write to the csv file
        let csv = result.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
        result = [];
        utils.wait(2000);
    } catch(e) {
        console.error('there was an error');
        console.error(e);
    }
    }
    
    await page.close();
    await browser.close();
}

exports.prepbaseballreportSocial = async (req, res, next) => {
    try {
        console.log('perfectgameUrls');
        await init();
        res.send({msg: 'Scrape Complete!'});
        console.log('Scrape Complete!');
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};