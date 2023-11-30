const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'http://nahl.com';
let OUTPUT_FILE = 'data/output/nahl-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('#teambar', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {

    let returnValue = [''];
    let elems = document.querySelectorAll('#teambar ul li');
    elems.forEach((elem) => {
        let name = elem.querySelector('a')?.getAttribute("title") || '';
        let url = elem.querySelector('a')?.href || '';
        returnValue.push(name);
        returnValue.push(url);
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

exports.nahl = async (socket) => {
    try {
        console.log('nahl');
        socket.send('inside soccer controller (nahl)');
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