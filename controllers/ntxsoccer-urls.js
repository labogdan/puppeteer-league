const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.ntxsoccer.org/youth-member-associations/';
let OUTPUT_FILE = 'data/output/ntxsoccer-urls.csv';
let csvRecords = [];

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('.site-section.main table', {timeout: 15000});
  let retVal = await page.evaluate(() => {    
    let returnValue = [''];

    let elem = document.querySelector('.site-section.main table');
    elem.querySelectorAll('td a').forEach((item, i) => {
      returnValue.push(i);
      returnValue.push(',');
      returnValue.push(item.textContent);
      returnValue.push(',');
      returnValue.push(item.href);
      returnValue.push('\n');
    });
    
    return returnValue;
  });
console.log(retVal);
  return retVal;
}


async function init (socket) {
    console.log('init');
    //await readData();
    console.log('warming up');
    socket.send('warming up');
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        slowMo: 300
    });
    console.log('spawned browser');

    const page = await browser.newPage();
    console.log('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
        }
    });

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    try {
        let ret = await scrapePage(page, socket);
        result.push(ret);
        let csv = result.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
        result = [];
        utils.wait(2000);
    } catch(e) {
        console.error('there was an error');
        console.error(e);
    }
    await page.close();
    await browser.close();
}


exports.ntxsoccer = async (socket) => {
    try {
        console.log('ntxsoccer');
        socket.send('inside soccer controller (ntxsoccer)');
        socket.send(`percentComplete:${30}`);
        await init(socket);
        socket.send('Scrape Complete!');
        socket.send(`percentComplete:${100}`);
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        socket.send('error');
      }
};