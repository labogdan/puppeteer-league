const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.alsoccer.org/find-a-club-2/';
let OUTPUT_FILE = 'data/output/alabamasoccer-urls.csv';
let csvRecords = [71201, 71301, 70032];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function filloutAndClick(page, record, socket) {
  //socket.send(`Filling out form for the following zip code: ${record}`);
  await page.waitForSelector('#CT_Main_0_pnlSearch', {timeout: 15000});
  await page.$eval('#CT_Main_0_txtLocation', (el, record) => {el.value = record}, record);
  await page.$eval('#CT_Main_0_drpMiles', el => el.value = '250');
  await page.$eval('#CT_Main_0_btnSearch', el => el.click());
  await utils.wait(3000);
};

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('.elementor.elementor-2572.elementor-location-single.post-4577.page.type-page.status-publish.hentry section section', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [];

    let sections = document.querySelectorAll('.elementor.elementor-2572.elementor-location-single.post-4577.page.type-page.status-publish.hentry section section');

    sections.forEach((section) => {
        let items = section.querySelectorAll('p');
        items.forEach((item) => {
          returnValue.push(item?.innerText);
          returnValue.push(',');
          returnValue.push(item?.querySelector('a')?.href);
          returnValue.push('\n');
        })
    });
    
    return returnValue;
  
  });

  console.log(retVal);
  return retVal;
}

async function init (socket) {
    //socket.send('init');
    //socket.send('warming up');

    const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
        slowMo: 100
    });
    //socket.send('spawned browser');

    const page = await browser.newPage();
    //socket.send('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        try {console.log(await msgArgs[i].jsonValue());} catch (e) {}
        }
    });

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    try {
      
        //socket.send(`Processing zip code ${i+1} of ${csvRecords.length}`);
        //await filloutAndClick(page, csvRecords[i], socket);
        let ret = await scrapePage(page);
        //socket.send(`percentComplete:${(i+1)/csvRecords.length*100}`);
        let csv = ret.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
      
    } catch(e) {
        //socket.send('error');
        console.error('there was an error');
        console.error(e);
    }
    await page.close();
    await browser.close();
}

exports.alabamaSoccer = async (socket, message) => {
    try {
        console.log('alabamaSoccer');
        //socket.send('inside soccer controller (playlouisianasoccer)');
        await init(socket);
        //socket.send('Scrape Complete!');
        //res.send({msg: 'ok'});
      } catch (error) {
        //socket.send('error');
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};