const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://tournaments.prepbaseballreport.com/';
let OUTPUT_FILE = 'data/output/prepbaseballreport-step1.csv';
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

let result = [];

async function setUpPage(page, record) {

}

function findElem (parent, selector) {
  /*let foundElements = [];
  let outerElements = parent;

    console.log(parent);
    console.log(outerElements.length);
    
  
    if (outerElements.length) {
      for (let i = 0; i < outerElements.length; i++) {
        let innerElements = outerElements[i].querySelectorAll(selector);
        console.log(innerElements);
        for (let j = 0; j < innerElements.length; j++) {
            foundElements.push(innerElements[j]);
        }
      }    
    } else {
      let innerElements = outerElements.querySelectorAll(selector);
      console.log(innerElements);
      for (let j = 0; j < innerElements.length; j++) {
        foundElements.push(innerElements[j]);
      }
    }
    
  return foundElements;*/

  return 'i ama coold';
}

async function scrapePage(page, counter) {
  console.log('scraping page');
  console.log(findElem);

  await page.waitForSelector('.list-container.layout-full .list-details', {timeout: 5000});
  let retVal = await page.evaluate((findElem, counter) => {    
    console.log('evaluating page');
    console.log(findElem);
    let returnValue = [''];
    [...document.querySelectorAll('.list-container.layout-full .list-details')].map((elem) => {
      console.log('found element');
      returnValue.push(counter);
      returnValue.push(',');
      returnValue.push(elem.querySelector('.list-details-left .list-title') ? elem.querySelector('.list-details-left .list-title').innerText : '');
      returnValue.push(',');
      returnValue.push(elem.querySelector('.list-details-left .list-city') ? elem.querySelector('.list-details-left .list-city').innerText : '');
      returnValue.push(',');
      returnValue.push(elem.querySelector('.list-details-left .list-venues') ? elem.querySelector('.list-details-left .list-venues').innerText : '');
      returnValue.push(',');
      returnValue.push(elem.querySelector('.list-details-left ul.small a') ? elem.querySelector('.list-details-left ul.small a').href : '');
      returnValue.push(',');
      
      let teamsUrl = () => {
        let url;
        elem.querySelectorAll('.list-links a').forEach((item) => {
            if (item.innerText === 'TEAMS') {
                url = item.href;
            }
        });
        return url;
      }

      returnValue.push(teamsUrl());
      returnValue.push('\n');
    });
    
    return returnValue;
  }, findElem, counter);
  console.log(retVal);
  return retVal;
}

async function deleteElements(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.list-container.layout-full').forEach((row) => {
      row.remove();
    });
  });   
}

async function scrollToBottomOfPage(page) {
  await page.evaluate(async () => {
    await new Promise(async (resolve, reject) => {
      let totalHeight = 0;
      let distance = 4000;
      let timer = setInterval(async () => {
        console.log('scrolling');
        console.log(document.querySelectorAll('#eventslist .list-container').length);
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        await utils.wait(1000);
        
        if(totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  });
}


async function init () {
    console.log('init');
    //await readData();
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        //slowMo: 100
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

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000}); //{waitUntil: 'load', timeout: 5000});
    await page.waitForSelector('#eventslist', {timeout: 5000});
    console.log('loaded page');
    await page.evaluate(() => {
      window.scrollBy(0, 2000);
    });
    for (i = 0; i < 10000; i++) {
        try {
          //await scrollToBottomOfPage(page);
          //console.log('scrolled to bottom of page');
          let results = await scrapePage(page, i);
          await page.evaluate(() => {
            window.scrollBy(0, 4000);
          });
          await utils.wait(2000);
          await deleteElements(page);
          await utils.wait(2000);
        
          let csv = results.join();
          fs.appendFileSync(OUTPUT_FILE, csv);
        } catch(e) {
        console.error('there was an error');
            console.error(e);
        }
    }
    await page.close();
    await browser.close();
}

exports.prepbaseballreportUrls = async (req, res, next) => {
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