const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/nahl3-urls.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/nahl3-final.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket, record, previous) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('#section2', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (previous) => {

    let returnValue = [''];
    
    let info = document.querySelectorAll('#section2 table td.first-row table.teamstable tr');
    let address = info[0]?.innerText.replaceAll('\n', ' ').replaceAll(',', ' ');
    let phone = info[1]?.innerText.replaceAll('\n', ' ').replaceAll(',', ' ');
    let socials = info[info.length-1]?.querySelectorAll('a');

    returnValue.push(previous);
    returnValue.push(address);
    returnValue.push(phone);

    socials.forEach((social) => {
        returnValue.push(social.href);
    });
    returnValue.push('\n');
    return returnValue;
  }, previous);

  console.log(retVal);
  return retVal;
}


async function init (socket) {
    console.log('init');
    csvRecords = await utils.readData(INPUT_FILE);
    console.log('warming up');
    socket.send('warming up');
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

    for (i = 0; i < csvRecords[0].length; i++) {
      let record = csvRecords[0][i][2];
      let previous = csvRecords[0][i];
      console.log(record);
      console.log(previous);

      try {
        await page.goto(record, {waitUntil: 'domcontentloaded', timeout: 15000});
        console.log('goto');
        let ret = await scrapePage(page, socket, record, previous);
        let csv = ret.join();
        fs.appendFileSync(OUTPUT_FILE, csv);

      } catch(e) {
          console.error('there was an error');
          console.error(e);
      }

    }

    await page.close();
    await browser.close();
}

exports.nahl3final = async (socket) => {
    try {
        console.log('nahl3-final');
        socket.send('inside soccer controller (nahl3-final)');
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