const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://girlsacademyleague.com/members/';
let OUTPUT_FILE = 'data/output/girlsacademyleague-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('.et_pb_section', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [''];
    let elems = document.querySelectorAll('.et_pb_section .et_pb_row .et_pb_column .et_pb_text_inner');

    elems.forEach((elem) => {
      let conference = elem.querySelector('h3')?.innerText;
      let clubs = elem.querySelectorAll('li');
    
      clubs.forEach((club) => {
          let name = club.querySelector('a')?.innerText;
          let href = club.querySelector('a')?.href;
          returnValue.push(conference);
          returnValue.push(name);
          returnValue.push(href);
          returnValue.push('\n');
      });
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
    const browser = await puppeteer.launch({
        headless: true,
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

exports.girlsacademyleague = async (socket) => {
    try {
        console.log('girlsacademyleague');
        socket.send('inside soccer controller (girlsacademyleague)');
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