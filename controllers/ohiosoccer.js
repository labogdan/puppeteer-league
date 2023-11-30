const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://ohio-soccer.org/find-a-place-to-play/';
let OUTPUT_FILE = 'data/output/ohiosoccer-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('.elementor-tabs', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [''];
    let sections = document.querySelectorAll('.elementor-tabs div[id*="elementor-tab-content"]');

    sections.forEach((section) => {
        let elems = section.querySelectorAll('p:not(.gray-divider)');
        let district = section.querySelector('h3')?.innerText;
        elems.forEach((elem) => {
            if (elem.innerText.length > 3) {
                let title = elem.querySelector('strong')?.innerText;
                let type = elem.querySelector('span.color-gray')?.innerText.split('|')[0];
                let href = elem.querySelector('span.color-gray a')?.href;
                
                returnValue.push(district);
                returnValue.push(',');
                returnValue.push(title);
                returnValue.push(',');
                returnValue.push(type);
                returnValue.push(',');
                returnValue.push(href);
                returnValue.push('\n');
            }
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

exports.ohiosoccer = async (socket) => {
    try {
        console.log('ohio-soccer');
        socket.send('inside soccer controller (ohio-soccer)');
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