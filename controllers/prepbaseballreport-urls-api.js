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


    //let i = 0;
    for (i = 0; i < 10000; i++) {
      const response = await fetch(`https://tournaments.prepbaseballreport.com/ajax-events?page=${i}&layout=full&past_events=false&events_exits=310`);
      const data = await response.json();
      console.log(data.eventlist);
      
      let results = [];
      data.eventlist.forEach((event) => {
        results.push(i);
        results.push(',');
        results.push(event.id);
        results.push(',');
        results.push(event.label);
        results.push(',');
        results.push(event.city);
        results.push(',');
        results.push(event.state); 
        results.push(',');
        results.push(event.url_key);
        results.push('\n');
      });

      let csv = results.join();
      fs.appendFileSync(OUTPUT_FILE, csv);
    }

    /*await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000}); //{waitUntil: 'load', timeout: 5000});
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
    await browser.close();*/
}

exports.prepbaseballreportUrlsAPI = async (req, res, next) => {
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