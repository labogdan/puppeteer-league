const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://theecnl.com/sports/2023/7/6/directory.aspx';
let OUTPUT_FILE = 'data/output/ecnlboys-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('section.s-directory', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [''];
    let elements = document.querySelectorAll('section.s-directory ul li');

    elements.forEach((element) => {
      let name = element.querySelector('.c-members__club .c-members__club-name')?.innerText || '';
      let location = element.querySelector('.c-members__club .c-members__club-location')?.innerText || '';
    
      let league = element.querySelector('.c-members__league .c-members__league-list')?.innerText.replaceAll('\n', ' ').replaceAll(',', ' ') || '';
      let website = element.querySelector('.c-members__social .c-members__social-item .c-members__social-site')?.href || '';
      let fb = element.querySelector('.c-members__social .c-members__social-item .c-members__social-facebook')?.href || '';
      let x = element.querySelector('.c-members__social .c-members__social-item .c-members__social-twitter')?.href || '';
      let insta = element.querySelector('.c-members__social .c-members__social-item .c-members__social-instagram')?.href || '';

      returnValue.push(name);
      returnValue.push(location);
      returnValue.push(league);
      returnValue.push(website);
      returnValue.push(fb);
      returnValue.push(x);
      returnValue.push(insta);
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

exports.ecnlboys = async (socket) => {
    try {
        console.log('ecnlboys');
        socket.send('inside soccer controller (coloradosoccer)');
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