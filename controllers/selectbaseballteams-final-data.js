const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/selectbaseballteams-urls-teams.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/selectbaseballteams-teams-final.csv';
let csvRecords = [];

let result = [];

async function scrapePage(page, csv) {
  console.log('scraping page');

  const previousData = csv;
  console.log(previousData);
  
  await page.waitForSelector('.col-sm-4 .field', {timeout: 15000});
  console.log('found view-content');
  let retVal = await page.evaluate((previousData) => {
    let returnValue = [''];

    let elem = document.querySelectorAll('.col-sm-4')[1];
    console.log(elem);

    returnValue.push(previousData);
    returnValue.push(',');
    returnValue.push(elem.querySelector('.field.field-name-field-organization-website a') ? elem.querySelector('.field.field-name-field-organization-website a').href : '');
    returnValue.push(',');
    returnValue.push(elem.querySelector('.field.field-name-field-phone .field-items') ? elem.querySelector('.field.field-name-field-phone .field-items').innerText : '');
    returnValue.push(',');
    returnValue.push(elem.querySelector('.field.field-name-field-facilities .field-items') ? elem.querySelector('.field.field-name-field-facilities .field-items').innerText.replace('\n', ',') : '');
    returnValue.push(',');
    returnValue.push(elem.querySelector('.field.field-name-field-paid-coaches .field-items') ? elem.querySelector('.field.field-name-field-paid-coaches .field-items').innerText : '');
    returnValue.push('\n');
    
    return returnValue;
  }, previousData);
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
        headless: true,
        devtools: true,
        slowMo: 700
      });
      console.log('spawned browser');
      utils.wait(1500);
      console.log('spawning new page');
      let page = await browser.newPage();
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
      await page.setUserAgent(ua);
      console.log('spawned new page');

      page.on('console', async (msg) => {
          const msgArgs = msg.args();
          for (let i = 0; i < msgArgs.length; ++i) {
          console.log(await msgArgs[i].jsonValue());
          }
      });
      
      console.log(randomArray[i]);
      console.log(randomArray[i][randomArray[i].length - 2]);
      console.log(randomArray[i][randomArray[i].length - 2].indexOf('youtube') !== -1)
      if (randomArray[i][randomArray[i].length - 2].indexOf('youtube') === -1) {
        try {
          await page.goto(randomArray[i][randomArray[i].length - 2], {waitUntil: 'domcontentloaded', timeout: 15000});
          let ret = await scrapePage(page, randomArray[i]);
          result.push(ret);
          let csv = result.join();
          fs.appendFileSync(OUTPUT_FILE, csv);
          result = [];
        } catch(e) {
          console.error('there was an error');
          console.error(e);
        }
        utils.wait(5000);
      }
      await page.close();
      await browser.close();
    }
    
}


exports.selectbaseballteamsFinalData = async (req, res, next) => {
    try {
        console.log('selectbaseballteamsFinalData');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};