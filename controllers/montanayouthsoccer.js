const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.montanayouthsoccer.com/about/member-clubs/';
let OUTPUT_FILE = 'data/output/montanayouthsoccer-urls.csv';
// let csvRecords = [83209, 83814, 83616];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('main.content', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];

    let elems = document.querySelectorAll('main.content table tr');
    
    elems.forEach((elem) => {
        let rows = elem.querySelectorAll('td');
        let name = rows[0]?.querySelector('a')?.innerText;
        let url = rows[0]?.querySelector('a')?.href;
        let city = rows[1]?.innerText;
    
        returnValue.push(name);
        returnValue.push(',');
        returnValue.push(url);
        returnValue.push(',');
        returnValue.push(city);
        returnValue.push('\n');
    });
    

    // this is old code - I think the site was redesigned
    /*let elements = document.querySelectorAll('.site-section.main .data-table tbody tr');
    elements.forEach( (element) => {
        let name = '';
        let href = '';
        let city = '';

        name = element.querySelector('td a')?.innerText;
        href = element.querySelector('td a')?.href;
        city = element.querySelectorAll('td')[1]?.innerText;
        
        returnValue.push(name);
        returnValue.push(',');
        returnValue.push(href);
        returnValue.push(',');
        returnValue.push(city);
        returnValue.push('\n');
    });*/
    
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

exports.montanayouthsoccer = async (socket) => {
    try {
        console.log('montanayouthsoccer');
        socket.send('inside soccer controller (montanayouthsoccer)');
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