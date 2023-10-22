const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.nebraskastatesoccer.org/Default.aspx?tabid=2679160';
let OUTPUT_FILE = 'data/output/nebraskastatesoccer-urls.csv';
// let csvRecords = [83209, 83814, 83616];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function filloutAndClick(page) {
  console.log('filloutAndClick');
  await page.waitForSelector('a#searchButton', {timeout: 15000});  
  await page.$eval('a#searchButton', el => el.click());
  console.log('clicked search');
  await utils.wait(3000);
  console.log('waited');
};

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('#locationList', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [''];
    
    let utils = {};
    utils.removeWhitespaceAndNewlines = (input) => {
      return input.replace(/\s/g, " ");
    }

    let elems = document.querySelectorAll('#locationList tr.list');
    elems.forEach(elem => {
      let top = elem.querySelector('table tr td table tr td.v-h-b-padding');
      let bottom = elem.querySelector('table tr td table tr td table tr table.v-h-t-margin td.content-text');
      
      let name = top.querySelector('h4')?.innerText || '';
      let href = top.querySelector('a')?.href || '';

      let address = bottom.querySelectorAll('div')[0]?.innerText || '';
      let phone = bottom.querySelectorAll('div')[1]?.innerText || '';
      let email = bottom.querySelectorAll('div')[2]?.innerText || '';

      returnValue.push(name);
      returnValue.push(',');
      returnValue.push(utils.removeWhitespaceAndNewlines(address));
      returnValue.push(',');
      returnValue.push(phone);
      returnValue.push(',');
      returnValue.push(email);
      returnValue.push(',');
      returnValue.push(href);
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
    socket.send(`warming up`);
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        slowMo: 100
    });
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
      await filloutAndClick(page);
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

exports.nebraskastatesoccer = async (socket) => {
    try {
        console.log('nebraskastatesoccer');
        socket.send('inside soccer controller (nebraskastatesoccer)');
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