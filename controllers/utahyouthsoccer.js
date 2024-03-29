const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.utahyouthsoccer.net/find-a-club';
let OUTPUT_FILE = 'data/output/utahyouthsoccer-urls.csv';
// let csvRecords = [83209, 83814, 83616];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('.sqs-block.html-block.sqs-block-html', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    let elements = document.querySelectorAll('.sqs-block.html-block.sqs-block-html');
    elements.forEach( (element) => {
        let elementData = element.querySelectorAll('p')[1]?.innerText.replaceAll(',',';').split("\n");
        let name = '';
        let href = '';
        let established = '';
        let programs = '';
        let headquarters = '';

        if (elementData) {
            name = element.querySelector('p a').innerText;
            href = element.querySelector('p a').href;
            for (let i = 0; i < elementData.length; i++) {
                if (elementData[i].indexOf('Est') !== -1) {
                    established = elementData[i];
                } else if (elementData[i].indexOf('Programs') !== -1) {
                    programs = elementData[i];
                } else if (elementData[i].indexOf('Headquarters') !== -1) {
                    headquarters = elementData[i];
                    if (i < elementData.length-1) { headquarters += elementData[i+1]; }
                }
            }    
        }
        returnValue.push(name);
        returnValue.push(',');
        returnValue.push(href);
        returnValue.push(',');
        returnValue.push(established);
        returnValue.push(',');
        returnValue.push(programs);
        returnValue.push(',');
        returnValue.push(headquarters);
        returnValue.push('\n');
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

exports.utahyouthsoccer = async (req, res, next) => {
    try {
        console.log('perfectgameUrls');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};