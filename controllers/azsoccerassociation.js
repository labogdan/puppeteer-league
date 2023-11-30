const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');
const { error } = require('console');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.azsoccerassociation.org/about/member-clubs/';
let OUTPUT_FILE = 'data/output/azsoccerassociation-urls.csv';
let csvRecords = [];

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`percentComplete:${30}`);
  socket.send(`scraping page`);

  try {
    await page.waitForSelector('main.content', {timeout: 5000});
    let retVal = await page.evaluate(() => {    
      let returnValue = [''];

      let elements = document.querySelectorAll('main.content .ghostkit-col-content');
      
      elements.forEach((element) => {
        let title = element.querySelector('figcaption a')?.innerHTML || '';
        let url = element.querySelector('figcaption a')?.href || '';
                
        returnValue.push(title);
        returnValue.push(url);
        returnValue.push('\n');
      });
      
  
      return returnValue;
    });
    socket.send(`percentComplete:${80}`);
    console.log(retVal);
  return retVal;
  } catch(e) {
    console.error(e);
    //socket.send('error');
    return new Promise((resolve, reject) => {
      reject(e);
    }
    );
  }
  //await page.waitForSelector('#accordion', {timeout: 5000});
  
  
}

async function init (socket) {
    console.log('init');
    console.log('warming up');
    const browser = await utils.initChrome(socket);
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
    
//    try {
        let ret = await scrapePage(page, socket);
        result.push(ret);
        let csv = result.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
        result = [];
        utils.wait(2000);
        console.log('done');
    //} catch(e) {
  //      console.error('there was an error');
  //      console.error(e);
  //      socket.send('error');
    //}

    await page.close();
    await browser.close();
}

exports.azsoccerassociation = async (socket) => {
    try {
        console.log('azsoccerassociation');
        socket.send('inside soccer controller (azsoccerassociation)');
        socket.send(`percentComplete:${10}`);
        await init(socket);
        socket.send('Scrape Complete!');
        socket.send(`percentComplete:${100}`);
      } catch (error) {
        console.error('there was an error');
        socket.send('error');
        console.error(error);
        //res.status(500).send('Internal Server Error');
      }
};