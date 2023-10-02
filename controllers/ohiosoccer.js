const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://ohio-soccer.org/find-a-place-to-play/';
let OUTPUT_FILE = 'data/output/ohio-soccer.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page) {
  console.log('scraping page');

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


async function init () {
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
        let ret = await scrapePage(page);
        let csv = ret.join();
        fs.appendFileSync(OUTPUT_FILE, csv);

    } catch(e) {
        console.error('there was an error');
        console.error(e);
    }
    await page.close();
    await browser.close();
}

exports.ohiosoccer = async (req, res, next) => {
    try {
        console.log('ohio-soccer');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};