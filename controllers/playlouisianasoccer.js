const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.playlouisianasoccer.org/clubs/club-directory/';
let OUTPUT_FILE = 'data/output/playlouisianasoccer-urls.csv';
let csvRecords = [71201, 71301, 70032];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function filloutAndClick(page, record, socket) {
  socket.send(`Filling out form for the following zip code: ${record}`);
  await page.waitForSelector('#CT_Main_0_pnlSearch', {timeout: 15000});
  await page.$eval('#CT_Main_0_txtLocation', (el, record) => {el.value = record}, record);
  await page.$eval('#CT_Main_0_drpMiles', el => el.value = '250');
  await page.$eval('#CT_Main_0_btnSearch', el => el.click());
  await utils.wait(3000);
};

async function scrapePage(page, record, socket) {
  socket.send('scraping page');

  await page.waitForSelector('#CT_Main_0_pnlResults', {timeout: 15000});
  socket.send('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let elems = document.querySelectorAll('#CT_Main_0_pnlResults .content .location-item');
    elems.forEach(elem => {
      let el = elem.querySelector('.location-item-text');
      let name = el.innerText.split('\n')[0];
      let address = el.innerText.split('\n')[1] + ' ' + el.innerText.split('\n')[2];
      let url = el.querySelector('a.more').href;
      returnValue.push(record);
      returnValue.push(',');
      returnValue.push(name);
      returnValue.push(',');
      returnValue.push(address);
      returnValue.push(',');
      returnValue.push(url);
      returnValue.push('\n');
    });
    return returnValue;
  
  }, record);

  console.log(retVal);
  return retVal;
}

async function init (socket, zipCodes) {
    socket.send('init');
    socket.send('warming up');

    if (zipCodes.length > 0) {
      csvRecords = zipCodes;
      socket.send(`zip codes: ${csvRecords}`);
    }

    const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
        slowMo: 100
    });
    socket.send('spawned browser');

    const page = await browser.newPage();
    socket.send('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        try {console.log(await msgArgs[i].jsonValue());} catch (e) {}
        }
    });

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    try {
      for (let i = 0;i < csvRecords.length; i++) {
        socket.send(`Processing zip code ${i+1} of ${csvRecords.length}`);
        await filloutAndClick(page, csvRecords[i], socket);
        let ret = await scrapePage(page, csvRecords[i], socket);
        socket.send(`percentComplete:${(i+1)/csvRecords.length*100}`);
        let csv = ret.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
      }
    } catch(e) {
        socket.send('error');
        console.error('there was an error');
        console.error(e);
    }
    await page.close();
    await browser.close();
}

exports.playlouisianasoccer = async (socket, message) => {
    try {
        console.log('playlouisianasoccer');
        console.log(message);
        let zipCodes = message.split(',');
        console.log(zipCodes);
        socket.send('inside soccer controller (playlouisianasoccer)');
        await init(socket, zipCodes);
        socket.send('Scrape Complete!');
        //res.send({msg: 'ok'});
      } catch (error) {
        socket.send('error');
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};