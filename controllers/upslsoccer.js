const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://premier.upsl.com/teams/?state=false&division=false&conference=false';
let OUTPUT_FILE = 'data/output/upslsoccer-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('div.grid-container', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [''];
    let elems = document.querySelectorAll('.cell.small-6.medium-4.large-2.teams__card--container.isotope-item');
    elems.forEach((elem) => {
      let division = elem.querySelector('.teams__card--division')?.innerText || '';
      let name = elem.querySelector('.teams__card--content h5')?.innerText || '';
      let location = elem.querySelector('.teams__card--content p')?.innerText || '';
      let url = elem.querySelector('a')?.href || '';      

      returnValue.push(name);
      returnValue.push(location);
      returnValue.push(division);
      returnValue.push(url);
      
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

    try {
        await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
        console.log('goto');
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

exports.upslsoccer = async (socket) => {
    try {
        console.log('upslsoccer');
        socket.send('inside soccer controller (upslsoccer)');
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