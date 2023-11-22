const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.alaskayouthsoccer.org/community/affiliate-clubs/';
let OUTPUT_FILE = 'data/output/alaskayouthsoccer-urls.csv';
// let csvRecords = [83209, 83814, 83616];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`percentComplete:${60}`);
  socket.send(`scraping page`);
  await page.waitForSelector('.container .grid_8', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [''];
    
    let top = document.querySelector('.container .grid_8 .block');
    let bottom = document.querySelector('.container .grid_12 .block');
    
    let topElements = top.querySelectorAll('.clubGrid .subGrid')
    let bottomElements = bottom.querySelectorAll('.clubGrid .subGrid')
    
    let merged1 = [...topElements];
    let merged2 = Array.from(bottomElements);
    let final = merged1.concat(merged2)
    final.forEach((item) => {
        console.log(item)
        let items = item.querySelectorAll('div');
        let href = items[1].querySelector('a')?.href;
        let name = items[1].querySelector('a')?.innerText;
        let moreInfo = items[1].querySelectorAll('p')[1].innerText.replace(/\s/g, " / ");
        returnValue.push(name);
        returnValue.push(',');
        returnValue.push(href);
        returnValue.push(',');
        returnValue.push(moreInfo);
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
    const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
        slowMo: 100,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

exports.alaskayouthsoccer = async (socket) => {
    try {
        console.log('alaskayouthsoccer');
        socket.send('inside soccer controller (alaskayouthsoccer)');
        socket.send(`percentComplete:${30}`);
        await init(socket);
        socket.send('Scrape Complete!');
        socket.send(`percentComplete:${100}`);
        //res.send({msg: 'ok'});
      } catch (error) {
        socket.send('error');
        console.error('there was an error');
        console.error(error);
        //res.status(500).send('Internal Server Error');
      }
};