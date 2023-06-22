const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/prepbaseballreport-step2.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/prepbaseballreport-step3.csv';
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
  return `https://tournaments.prepbaseballreport.com/events/${eventId}/teams`
}

let result = [];

async function setUpPage(page, record) {

}

async function scrapePage(page, previousValue) {
  console.log('scraping page');
  
  await page.waitForSelector('#teamsAccordion', {timeout: 5000});
  let retVal = await page.evaluate((previousValue) => {    
    console.log('evaluating page');
    let returnValue = [];
    document.querySelectorAll('#teamsAccordion .team-list .panel-heading').forEach((elem) => {
      console.log('found element');
      returnValue.push(previousValue);
      returnValue.push(',');
      console.log(elem.querySelector('a') ? elem.querySelector('a').innerText : '');
      returnValue.push(elem.querySelector('a') ? elem.querySelector('a').innerText.replace(/\n/g, "") : '');
      returnValue.push(',');
      returnValue.push(elem.querySelector('small') ? elem.querySelector('small').innerText.replace(/\n/g, "") : '');
      returnValue.push(',');
      returnValue.push(elem.querySelector('a') ? elem.querySelector('a').href : '');
      returnValue.push('\n');
    });
    
    return returnValue;
  }, previousValue);
  console.log(retVal);
  return retVal;
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
      console.log(csvRecords[0][i][17]);
      try {
        eventId = csvRecords[0][i][17];
        await page.goto(inputURL(csvRecords[0][i][17]), {waitUntil: 'domcontentloaded', timeout: 15000});
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

exports.prepbaseballreportTeams = async (req, res, next) => {
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