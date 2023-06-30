const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/selectbaseballteams-urls-rankings.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/selectbaseballteams-urls-teams.csv';
let csvRecords = [];

let result = [];

async function scrapePage(page, csv, counter) {
  console.log('scraping page');

  const state = csv[1];
  console.log(state);
  
  await page.waitForSelector('.view-content', {timeout: 15000});
  console.log('found view-content');
  let retVal = await page.evaluate((state, counter) => {
    let returnValue = [''];

    let elem = document.querySelector('.view-content');
    console.log(elem);
    elem.querySelectorAll('a').forEach((item, i) => {
      returnValue.push(counter);
      returnValue.push(',');
      returnValue.push(state);
      returnValue.push(',');
      returnValue.push(item.textContent);
      returnValue.push(',');
      returnValue.push(item.href);
      returnValue.push('\n');
    });
    
    return returnValue;
  }, state, counter);
console.log(retVal);
  return retVal;
}

async function init () {
    console.log('init');
    csvRecords = await utils.readData(INPUT_FILE);
    console.log('warming up');
    
    let randomArray = utils.dontSelectRandomValuesFromArray(csvRecords[0], csvRecords[0].length);
    console.warn(randomArray[0][4]);
    for (let i = 0; i < randomArray.length; i++) {
      utils.wait(1500);
      let browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        slowMo: 300
      });
      console.log('spawned browser');
      utils.wait(1500);
      console.log('spawning new page');
      let page = await browser.newPage();
      console.log('spawned new page');

      page.on('console', async (msg) => {
          const msgArgs = msg.args();
          for (let i = 0; i < msgArgs.length; ++i) {
          console.log(await msgArgs[i].jsonValue());
          }
      });
      
      await page.goto(randomArray[i][4], {waitUntil: 'domcontentloaded', timeout: 15000});
      try {
        let ret = await scrapePage(page, randomArray[i], i);
        result.push(ret);
        let csv = result.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
        result = [];
      } catch(e) {
        console.error('there was an error');
        console.error(e);
      }
      utils.wait(5000);
      await page.close();
      await browser.close();
    }
    
}


exports.selectbaseballteamsUrlsTeams = async (req, res, next) => {
    try {
        console.log('selectbaseballteamsUrlsTeams');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};