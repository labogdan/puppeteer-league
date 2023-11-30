const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = 'https://www.kysoccer.net/member-directory/';
let OUTPUT_FILE = 'data/output/kysoccer-urls.csv';
let csvRecords = [];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

async function scrapePage(page, socket) {
  console.log('scraping page');
  socket.send(`scraping page`);

  await page.waitForSelector('.ghostkit-accordion-item', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async () => {
    let returnValue = [''];
    
    let districts = document.querySelectorAll('.ghostkit-accordion-item');

    districts.forEach((district) => {
      let districtName = district.querySelector('a.ghostkit-accordion-item-heading')?.innerText;
      let rows = district.querySelectorAll('tr');

      rows.forEach((row) => {
        let links = row.querySelectorAll('a');
        let website = links[0]?.href || '';
        let email = links[1]?.href.split(':')[1] || ''


        let listOfData = row.innerHTML.split('<br>');

        let name = listOfData[0].split('<strong>')[1]?.split('</strong>')[0]
        let address = listOfData[2]?.split(':')[1]?.replaceAll('&nbsp;', ' ').replaceAll(',',' ') + listOfData[3]?.split(':')[1]?.replaceAll('&nbsp;', ' ').replaceAll(',',' ');
        let phone = listOfData[4]?.split(':')[1];
        let contact = listOfData[listOfData.length - 1]?.split(':')[1]?.replaceAll('</td>', '');


        if (name && name.length) {
          returnValue.push(districtName);

          returnValue.push(name);
          returnValue.push(address);
          returnValue.push(phone);
          returnValue.push(contact);
          returnValue.push(website);
          returnValue.push(email);
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
    socket.send(`warming up`);
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

exports.kysoccer = async (socket) => {
    try {
        console.log('kysoccer');
        socket.send('inside soccer controller (kysoccer)');
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