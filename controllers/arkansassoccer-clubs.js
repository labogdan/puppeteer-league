const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/arkansassoccer-urls.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/arkansassoccer-clubs.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, record, previous, socket) {
  socket.send('scraping page');

  await page.waitForSelector('.location-info table tr td', {timeout: 15000});
  socket.send('found results');

  let retVal = await page.evaluate( async (previous) => {
    let returnValue = [''];
    let elems = document.querySelectorAll('.location-info table tr td');
    returnValue.push(previous);
    returnValue.push(',');
    returnValue.push(elems[0]?.querySelector('a')?.href || '');
    returnValue.push(',');
    returnValue.push(elems[1]?.innerText || '');
    returnValue.push('\n');
    return returnValue;
  
  }, previous);

  console.log(retVal);
  return retVal;
}

async function init (socket) {
  socket.send('init');
  
    csvRecords = await utils.readData(INPUT_FILE);
    socket.send('warming up');
    const browser = await utils.initChrome(socket);
    console.log('spawned browser');

    const page = await browser.newPage();
    console.log('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        try {console.log(await msgArgs[i].jsonValue());} catch (e) {}
        }
    });

    for (i = 0; i < csvRecords[0].length - 1; i++) {
      let record = csvRecords[0][i][11];
      let previous = csvRecords[0][i];
      console.log(record);
      console.log(previous);
      try {
        await page.goto(record, {waitUntil: 'domcontentloaded', timeout: 15000});
        let ret = await scrapePage(page, record, previous, socket);
        socket.send(`percentComplete:${(i+1)/csvRecords.length*100}`);
        console.log(ret.length);
        if (ret.length === 1) {
          break;
        }
        let csv = ret.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
      } catch(e) {
          console.error('there was an error');
          console.error(e);
      }
    }

    await page.close();
    await browser.close();
}

exports.arkansassoccerclubs = async (socket) => {
    try {
        console.log('arkansassoccerclubs');
        socket.send('inside soccer controller (arkansassoccerclubs)');
        await init(socket);
        socket.send('Scrape Complete!');
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        socket.send('error');
      }
};