const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.soccerindiana.org/find-a-club/';
let OUTPUT_FILE = 'data/output/soccerindiana-urls.csv';
// let csvRecords = [83209, 83814, 83616];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('.wp-block-genesis-blocks-gb-columns.gb-layout-columns-2.gb-2-col-equal', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];

    let elems = document.querySelectorAll('.wp-block-genesis-blocks-gb-columns.gb-layout-columns-2.gb-2-col-equal');

    elems.forEach((elem) => {
        let rows = elem.querySelectorAll('.gb-block-accordion table tr')
        
        rows.forEach((data) => {
            let name = data.querySelector('a')?.innerHTML;
            let url = data.querySelector('a')?.href;
            let city = data.querySelectorAll('td')[2]?.innerHTML;
            
            returnValue.push(name);
            returnValue.push(',');
            returnValue.push(url);
            returnValue.push(',');
            returnValue.push(city);
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

exports.soccerindiana = async (socket) => {
    try {
        console.log('soccerindiana');
        socket.send('inside soccer controller (soccerindiana)');
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