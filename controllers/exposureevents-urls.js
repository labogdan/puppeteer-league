const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://exposureevents.com/youth-events';
let OUTPUT_FILE = 'data/output/exposureevents-urls-2.csv';
const records = [
//  "Baseball",
//  "Basketball",
//  "Football",
//  "Hockey",
//  "Lacrosse",
//  "Pickleball",
//  "Soccer",
//  "Softball",
  "Volleyball",
//  "Water Polo",
//  "Wrestling",
  "FieldHockey",
];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};


let result = [];

async function filloutAndClick(page, sport) {
  await page.waitForSelector('#SearchCriteria_SportType', {timeout: 15000});  
  await page.$eval('button.btn.btn-secondary.mr-2.btn-check', el => el.click());

  await page.$eval('#SearchCriteria_SportType', (el, sport) => {el.value = sport}, sport);
  await page.evaluate(() => {
    let element = document.querySelector('#SearchCriteria_SportType');
    let event = new Event("change");
    element.dispatchEvent(event);
  });

  await utils.wait(500);
  
  await page.$eval('#StartDateString', (el) => {el.value = '1/1/2023'});
  await page.$eval('#EndDateString', (el) => {el.value = '12/31/2023'});
  
  await page.$eval('button[type="submit"].btn.btn-primary', el => el.click());
  await utils.wait(500);
};

async function scrapePage(page, record) {
  console.log('scraping page');

  await page.waitForSelector('.row-directory.row:not(.hidden)', {timeout: 15000});
  console.log('found results');

let retVal = await page.evaluate( async (record) => {
  console.log('evaluating page');
  console.log(document.querySelector('.mr-sm-2.mb-2.mb-md-0.text-center.text-md-right').innerText);

    const wait = (val) => {
      return new Promise(resolve => setTimeout(resolve, val));
    };

    let returnValue = [''];
    let elems = document.querySelector('.row-directory.row:not(.hidden)').querySelectorAll('.card-body');
    console.log(elems);
    await wait(5000);
    elems.forEach(elem => {
      let name = elem.querySelector('.display-8 a').innerText;
      let url = elem.querySelector('.display-8 a').href;  
      let city = elem.querySelector('.mb-3.mb-sm-0 span').innerText;
      let state = elem.querySelector('.mb-3.mb-sm-0 a').innerText;
      let details = [];
      elem.querySelectorAll('ul li').forEach(item => {
        details.push(item.innerText)
      });
      returnValue.push(record);
      returnValue.push(',');
      returnValue.push(name);
      returnValue.push(',');
      returnValue.push(url);
      returnValue.push(',');
      returnValue.push(city);
      returnValue.push(',');
      returnValue.push(state);
      returnValue.push(',');
      returnValue.push(details.join(' '));
      returnValue.push('\n');
    });
    console.log(returnValue);
    return returnValue;
  }, record);

  console.log(retVal);
  return retVal;
}

async function clickNext(page) {
  await page.waitForSelector('.page-item', {timeout: 15000});
  await page.evaluate(() => {
    let pager = document.querySelectorAll('.page-item');
    pager[pager.length-1].querySelector('.page-link').click();
  });
  console.log('clicked next');

}

async function pagerEnabled(page) {
  await page.waitForSelector('.page-item', {timeout: 15000});
  let pager = await page.evaluate(() => {
    let pager = document.querySelectorAll('.page-item');
    return pager[pager.length-1].classList.contains('disabled');
  });
  console.log('pagerEnabled: ' + !pager);
  return !pager;
}

async function init () {
    console.log('init');
    //await readData();
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: false,
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

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    for (let sport in records) {
      console.log('scraping ' + records[sport]);
      await filloutAndClick(page, records[sport]);
      try {
        /*if (await pagerEnabled(page) === false) {
          console.log('only one page of results');
          let ret = await scrapePage(page, records[sport]);
          console.log(ret.length);
          let csv = ret.join();
          fs.appendFileSync(OUTPUT_FILE, csv);
        } else {*/
          while(await pagerEnabled(page)) { // this is returning early and missing the last restults page
            console.log('more than one page of results');
            let ret = await scrapePage(page, records[sport]);
            console.log(ret.length);
            if (ret.length === 1) {
              break;
            }
            let csv = ret.join();
            fs.appendFileSync(OUTPUT_FILE, csv);
            await clickNext(page);
            await utils.wait(5000);
          }
        //}
      } catch(e) {
          console.error('there was an error');
          console.error(e);
      }
    }
    await page.close();
    await browser.close();
}

exports.exposureEventsUrls = async (req, res, next) => {
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