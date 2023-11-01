const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://ushl.com/calendar.aspx';
let OUTPUT_FILE = 'data/output/ushl-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('.c-members__list', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {

    function classContainsString(element, searchString) {
      var regex = new RegExp(`\\b${searchString}\\b`);
      return Array.from(element.classList).some(function (className) {
        return regex.test(className);
      });
    }

    let returnValue = [''];
    let elems = document.querySelectorAll('.c-members__list');
    
    elems.forEach((elem) => {
        let conference;
        if (classContainsString(elem, 'eastern')) {
            conference = 'Eastern';
        } else if (classContainsString(elem, 'western')) {
            conference = 'Western';
        }
        let items = elem.querySelectorAll('li.c-members__item');
        items.forEach((item) => {
          returnValue.push(conference);
            let name = item.querySelector('a span')?.innerText || '';
            let url = item.querySelector('a')?.href || '';
            returnValue.push(name);
            returnValue.push(url);
            returnValue.push('\n');
        })
        
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

exports.ushl = async (socket) => {
    try {
        console.log('ushl');
        socket.send('inside soccer controller (ushl)');
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