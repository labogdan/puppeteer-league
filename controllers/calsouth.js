const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');
const { all } = require('axios');

let INPUT_FILE = '';
let INPUT_URL = 'https://calsouth.com/find-a-place-to-play/';
let OUTPUT_FILE = 'data/output/calsouth.csv';
let csvRecords = [];

let result = [];

async function setUpPage(page, record) {

}

async function scrapePage(page, rowNum) {
  console.log('scraping page');

  await page.waitForSelector('.wpgmza_marker_list_class', {timeout: 5000});
  
  //let allFiveReturnValues = [];
  console.log(1);
  

  let retVal = await page.evaluate(async (rowNum) => {    
    console.log(2);
    const wait = (val) => {
      return new Promise(resolve => setTimeout(resolve, val));
    };

    let returnValue = [''];

    let items = [...document.querySelectorAll('.wpgmza_marker_list_class.wpgmza-shadow-sm.wpgmza_innermap_holder div.wpgmaps_blist_row')];
    console.log(items);
    for (let i = 0; i < items.length; i++) {
      let row = items[i];
      await wait(1000);
        
      console.log(row);
      console.log('clicked');
      row.click();

      await wait(1000);
      let overlay = document.querySelector('.wpgmza-infowindow');
      console.log(overlay);
      returnValue.push(rowNum);
      returnValue.push(',');
      returnValue.push(overlay.querySelector('.wpgmza_infowindow_title') ? overlay.querySelector('.wpgmza_infowindow_title').innerText : '');
      returnValue.push(',');
      returnValue.push(overlay.querySelector('.wpgmza_infowindow_categories') ? overlay.querySelector('.wpgmza_infowindow_categories').innerText : '');
      returnValue.push(',');
      returnValue.push(overlay.querySelector('.wpgmza_infowindow_link a') ? overlay.querySelector('.wpgmza_infowindow_link a').href : '');
      returnValue.push(',');
      overlay.querySelectorAll('.wpgmza_infowindow_description p').forEach((node) => {
        node.childNodes.forEach((childNode) => {
            if(childNode.nodeType == 3) {
              returnValue.push(childNode.textContent);
              returnValue.push(',');
            }
        });
      });
      returnValue.push('\n');
    }
    
    return returnValue;
  }, rowNum);

  console.log(retVal);
  return retVal;
}

async function paginate(page) {
  console.log('paginating');
  await utils.wait(1000);

  // don't wait for waitForResponse, but continue by omitting await
  const httpResponseWeWaitForPromise = page.waitForResponse((response) => {
    return response.url().startsWith('https://calsouth.com/wp-json')
  });
  console.log('waiting for response');
  // HXR request to wait for / intercept happens here
  await page.click('.paginationjs-next.J-paginationjs-next a');
  // wait for the Promise to get resolved
  const httpResponseWeWait = await httpResponseWeWaitForPromise;
  console.log('got response');
  await utils.wait(4000);
  console.log('clicked pagination');
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
          try {
            console.log(await msgArgs[i].jsonValue());
          } catch (e){
          }
          
        }
    });

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000}); //{waitUntil: 'load', timeout: 5000});
    
    for (i = 0; i < 35; i++) {
        try {
          let ret = await scrapePage(page, i);
          result.push(ret);
          let csv = result.join();
          fs.appendFileSync(OUTPUT_FILE, csv);
          result = [];
          utils.wait(2000);
          await paginate(page);
        } catch(e) {
          console.error('there was an error');
          console.error(e);
        }
    }
    await page.close();
    await browser.close();
}


exports.calsouth = async (req, res, next) => {
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