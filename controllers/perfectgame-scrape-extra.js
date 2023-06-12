const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/perfectgame-step2.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/perfectgame-step3.csv';

let csvRecords = [];

async function readData() {
  const readStream = fs.readFileSync(INPUT_FILE, {
    encoding: 'utf8',
  });
  
  csvRecords.push(
    readStream.split(/\r?\n/).map((line) => {
        return line.split(',');
    })
  );  
}

let result = [];

async function setUpPage(page, record) {

}

async function scrapePageForOrgInfo(page, previousData) {
  await page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_hlOrganizationName', {timeout: 10000});
  let data = [''];

  let orgName = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_hlOrganizationName').textContent;
  });

  let hometown = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblTeamHomeTown').textContent;
  });

  let orgUrl = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_hlOrganizationName').href;
  });


  let ids = await page.evaluate(() => {
    return document.location.href;
  },);
    
    data.push(previousData);
    data.push(orgName);
    data.push(hometown);
    data.push(utils.getParameterByName('orgid', ids));
    data.push(utils.getParameterByName('orgteamid', ids));
    data.push(utils.getParameterByName('team', ids));
    data.push(orgUrl);

    console.log(data);

  return data;
}

async function init () {
    console.log('init');
    await readData();
    console.log('warming up');
    /*console.log(csvRecords);
    console.log('*');
    console.log(csvRecords[0]);
    console.log('**');
    console.log(csvRecords[0][0]);
    console.log('***');
    console.log(csvRecords[0][0][csvRecords[0][0].length - 2]);*/
    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
        //slowMo: 100
    });
    console.log('spawned browser');

    let page = await browser.newPage();
    console.log('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
        }
    });
    for (i = 0; i < csvRecords[0].length; i++) {
      console.log(csvRecords[0][i][csvRecords[0][i].length - 2]);
        try {
            await page.goto(csvRecords[0][i][csvRecords[0][i].length - 2], {waitUntil: 'domcontentloaded', timeout: 15000});
            let ret = await scrapePageForOrgInfo(page, csvRecords[0][i]);

            result.push('');
            result.push(ret);
            result.push('\n');

            // write to the csv file
            let csv = result.join();
            fs.appendFileSync(OUTPUT_FILE, csv);
            result = [];
            utils.wait(2000);
        } catch(e) {
            console.error('there was an error');
            console.error(e);
        }
    }
    await page.close();
    await browser.close();
}


exports.perfectgameScrapeExtraInfo = async (req, res, next) => {
    try {
        console.log('perfectgameScrape');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};