const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/perfectgame-urls.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/pergectgame-step2.csv';

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

async function scrapePageForContactInfo(page, record) {
  //await page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_pnlRegularContact', {timeout: 10000});
  
  const un = await Promise.race([
    page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_pnlRegularContact', { timeout: 10000})
    .catch(),
    page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_pnlContactPG', { timeout: 10000})
    .catch(),
    page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_pnlTournyDirector', { timeout: 10000})
  ]);

  let retVal = await page.evaluate((record) => {
    let returnValue = [''];
    let email = document.querySelector('#ContentTopLevel_ContentPlaceHolder1_hlEventDirectorEmail') ? document.querySelector('#ContentTopLevel_ContentPlaceHolder1_hlEventDirectorEmail').textContent : document.querySelector('#ContentTopLevel_ContentPlaceHolder1_hlDirectorEmail').textContent;
    let name = document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblEventDirectorName') ? document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblEventDirectorName').textContent : document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblDirectorName').textContent;
    let blob = document.querySelector('#ContentTopLevel_ContentPlaceHolder1_pnlLongballYouth') ? document.querySelector('#ContentTopLevel_ContentPlaceHolder1_pnlLongballYouth').innerText : '';
    
    returnValue.push(record);
    returnValue.push(',');
    returnValue.push(name);
    returnValue.push(',');
    returnValue.push(email);
    returnValue.push(',');
    returnValue.push(blob);
    returnValue.push(',');
    return returnValue;
  }, record);

  return retVal;
}

async function scrapePage(page, director) {
  console.log('scraping page');

  await page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_EventHeader1_pnlShow', {timeout: 10000});
  let retVal = await page.evaluate(() => {    
    let returnValue = [''];
    returnValue.push(document.querySelector('#ContentTopLevel_ContentPlaceHolder1_EventHeader1_lblEventNameNew').textContent);
    returnValue.push(',');
    returnValue.push(document.querySelector('#ContentTopLevel_ContentPlaceHolder1_EventHeader1_lblDatesNew').textContent);
    returnValue.push(',');
    returnValue.push(document.querySelector('#ContentTopLevel_ContentPlaceHolder1_EventHeader1_lblEventLocaGeneral').textContent);
    returnValue.push(',');
    return returnValue;
  });

  let retVals = [];

  retVals.push(director);
  retVals.push(retVal);

  return retVals;
}

async function scrapePageSchedule(page, previousData) {
  console.log('scraping page');

  await page.waitForSelector('.rgMasterTable', {timeout: 10000});

  let retVals = await page.evaluate((previousData) => {
    let returnValue = [''];
    let teams = document.querySelectorAll('.rgMasterTable .rgRow a');
    teams.forEach((row) => {
      returnValue.push(previousData);
      returnValue.push([row.innerHTML]);
      returnValue.push([row.href]);
      returnValue.push('\n');  
    });

    teams = document.querySelectorAll('.rgMasterTable .rgAltRow a');
    teams.forEach((row) => {
      returnValue.push(previousData);
      returnValue.push([row.innerHTML]);
      returnValue.push([row.href]);
      returnValue.push('\n');  
    });

    return returnValue;
  }, previousData);

  return retVals;
}

async function init () {
    console.log('init');
    await readData();
    console.log('warming up');
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
      console.log(' ');
      console.log('looping');
      console.warn(csvRecords[0][i][1]);
      let ret1 = [], ret2 = [], ret = [];
        //try {
      console.log(`scrape ${i}`);
      try {
        ///result.push(csvRecords[0][i][1]);
        //result.push(',');
        await page.goto(`https://www.perfectgame.org/Events/Default.aspx?event=${csvRecords[0][i][1]}#Director`, {waitUntil: 'domcontentloaded', timeout: 15000});
        ret1 = await scrapePageForContactInfo(page, csvRecords[0][i][1]);
        console.log(ret1);
      } catch(e) {
        console.log('no director data');
        console.log(e);
        result.push('');
        result.push(csvRecords[0][i][1]);
        result.push(',');
        result.push('no director data');
        result.push('\n');
      }
      await page.close();
      page = await browser.newPage();

      try {
        await page.goto(`https://www.perfectgame.org/Events/TournamentSchedule.aspx?event=${csvRecords[0][i][1]}`, {waitUntil: 'domcontentloaded', timeout: 15000});
        console.log('scraping schedule');
        ret2 = await scrapePage(page, ret1);
        console.log(ret2);
      } catch(e) {
        console.log('no schedule data');
        console.log(e);
        result.push('');
        result.push(csvRecords[0][i][1]);
        result.push(',');
        result.push('no schedule data');
        result.push('\n');
      }
      
      await page.close();
      page = await browser.newPage();
      try {
        await page.goto(`https://www.perfectgame.org/Events/TournamentTeams.aspx?event=${csvRecords[0][i][1]}`, {waitUntil: 'domcontentloaded', timeout: 15000});
        console.log('scraping teams');
        ret = await scrapePageSchedule(page, ret2);
        console.log(ret);

        result.push(ret);
        result.push('\n');

      } catch(e) {
        console.log('no team data');
        console.log(e);
        result.push('');
        result.push(csvRecords[0][i][1]);
        result.push(',');
        result.push('no team data');
        result.push('\n');
      }
      
      // write to the csv file
      let csv = result.join();
      fs.appendFileSync(OUTPUT_FILE, csv);
      result = [];
      utils.wait(2000);
       /* } catch(e) {
            result.push(csvRecords[0][i][1]);
            console.error('there was an error');
            console.error(e);
        }*/
    }
    await page.close();
    await browser.close();
}


exports.perfectgameScrape = async (req, res, next) => {
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