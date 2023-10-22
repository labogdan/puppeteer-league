const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.google.com/maps/d/viewer?mid=1rvsqsDHPFU1EYfmQY1HSqIiIxL9KSVyY&ll=40.549812800000026%2C-105.07871999999998&z=8';
let OUTPUT_FILE = 'data/output/coloradosoccer-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};


let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('div[index] .suEOdc', {timeout: 15000});

  let elems = await page.$$('div[index] .suEOdc');

  for (let i = 1; i < elems.length; i++) {
    await elems[i].evaluate(b => b.click());
    await utils.wait(3000);
    let retVal = await page.evaluate( () => {
      let returnValue = [''];
      let name = document.querySelector('.qqvbed-p83tee-lTBxed') ? document.querySelector('.qqvbed-p83tee-lTBxed').innerText : '';
      returnValue.push(name);
      returnValue.push(',');
      let address = document.querySelector('.fO2voc-jRmmHf-MZArnb-Q7Zjwb') ? document.querySelector('.fO2voc-jRmmHf-MZArnb-Q7Zjwb').innerText : '';
      returnValue.push(address);
      returnValue.push(',');
      let url = document.querySelector('.qqvbed-VTkLkc.fO2voc-jRmmHf-LJTIlf div a[target="_blank"]') ? document.querySelector('.qqvbed-VTkLkc.fO2voc-jRmmHf-LJTIlf div a[target="_blank"]').href : '';
      returnValue.push(url);
      returnValue.push(',');
      returnValue.push('\n');
      return returnValue;
    });
    console.log(retVal);
    let csv = retVal.join();
    fs.appendFileSync(OUTPUT_FILE, csv);
  }

  console.log(retVal);
  return retVal;
}


async function init (socket) {
    console.log('init');
    //await readData();
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
        // slowMo: 300
    });
    console.log('spawned browser');

    const page = await browser.newPage();
    console.log('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
        }
    });

    await page.goto(INPUT_URL, {waitUntil: 'domcontentloaded', timeout: 15000});
    
    try {
        let ret = await scrapePage(page, socket);
        // result.push(ret);
        // let csv = result.join();
        // fs.appendFileSync(OUTPUT_FILE, csv);
        // result = [];
        // utils.wait(2000);
    } catch(e) {
        console.error('there was an error');
        console.error(e);
    }
    await page.close();
    await browser.close();
}

exports.coloradosoccer = async (socket) => {
    try {
        console.log('coloradosoccer');
        socket.send('inside soccer controller (coloradosoccer)');
        socket.send(`percentComplete:${30}`);
        await init(socket);
        socket.send('Scrape Complete!');
        socket.send(`percentComplete:${100}`);
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        socket.send('error');
        //res.status(500).send('Internal Server Error');
      }
};