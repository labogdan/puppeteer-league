const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.mnyouthsoccer.org/page/show/5711728-club-members';
let OUTPUT_FILE = 'data/output/mnyouthsoccer-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('.tableWrapper table tr', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [''];
    let elems = document.querySelectorAll('.tableWrapper table tr');
    elems.forEach(item => {
      if (typeof item !== 'undefined') {
          let name = item.querySelector('span[style="font-family:arial,helvetica,sans-serif"]')?.innerText;
          let url = item.querySelector('a')?.href
          if (typeof name !== 'undefined') {
            returnValue.push(name);
            returnValue.push(',');
          }
          if (typeof url !== 'undefined') {
            returnValue.push(url);
            returnValue.push('\n');    
          }
      }
    });
    //console.log(returnValue);
    //await utils.wait(3000);
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

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    try {
        let ret = await scrapePage(page, socket);
        let csv = ret.join();
        fs.appendFileSync(OUTPUT_FILE, csv);

    } catch(e) {
        console.error('there was an error');
        console.error(e);
    }
    await page.close();
    await browser.close();
}

exports.mnyouthsoccer = async (socket) => {
    try {
        console.log('mnyouthsoccer');
        socket.send('inside soccer controller (mnyouthsoccer)');
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