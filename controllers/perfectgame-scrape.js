const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let csvRecords = [];

async function readData() {
  const readStream = fs.readFileSync('data/input/perfectgame-urls1.csv', {
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

async function scrapePageForContactInfo(page) {
  //await page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_pnlRegularContact', {timeout: 10000});
  
  const un = await Promise.race([
    page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_pnlRegularContact', { timeout: 10000})
    .catch(),
    page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_pnlContactPG', { timeout: 10000})
    .catch(),
    page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_pnlTournyDirector', { timeout: 10000})
  ]);

  let retVal = await page.evaluate(() => {
    let returnValue = [''];
    let email = document.querySelector('#ContentTopLevel_ContentPlaceHolder1_hlEventDirectorEmail') ? document.querySelector('#ContentTopLevel_ContentPlaceHolder1_hlEventDirectorEmail').textContent : document.querySelector('#ContentTopLevel_ContentPlaceHolder1_hlDirectorEmail').textContent;
    let name = document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblEventDirectorName') ? document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblEventDirectorName').textContent : document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblDirectorName').textContent;
    let blob = document.querySelector('#ContentTopLevel_ContentPlaceHolder1_pnlLongballYouth') ? document.querySelector('#ContentTopLevel_ContentPlaceHolder1_pnlLongballYouth').innerText : '';

    returnValue.push(name);
    returnValue.push(',');
    returnValue.push(email);
    returnValue.push(',');
    returnValue.push(blob);
    returnValue.push(',');
    return returnValue;
  });

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

  let retVals = await page.evaluate((retVal, director) => {
    let returnValue = [''];
    let teams = document.querySelectorAll('[id^="ContentTopLevel_ContentPlaceHolder1_TS1_repTeams_hlTeam"]');
    teams.forEach((row) => {
      returnValue.push(director);
      returnValue.push(retVal);
      returnValue.push([row.innerHTML]);
      returnValue.push([row.href]);
      returnValue.push('\n');  
    });
    return returnValue;
  }, retVal, director);

  return retVals;
}

async function paginate(page) {
  console.log('paginating');
  await utils.wait(1000);

  // don't wait for waitForResponse, but continue by omitting await
  const httpResponseWeWaitForPromise = page.waitForResponse((response) => {
    return response.url().startsWith('https://www.perfectgame.org/schedule/?Type=Tournaments')
  });
  console.log('waiting for response');
  // HXR request to wait for / intercept happens here
  await page.click('button[title="Next Page"]');
  // wait for the Promise to get resolved
  const httpResponseWeWait = await httpResponseWeWaitForPromise;
  console.log('got response');
  await utils.wait(4000);
  console.log('clicked pagination');
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
      console.log('looping');
      console.log(csvRecords[0][i][1]);
        try {
            console.log('scrape 1');
            await page.goto(`https://www.perfectgame.org/Events/Default.aspx?event=${csvRecords[0][i][1]}#Director`, {waitUntil: 'domcontentloaded', timeout: 15000});
            let ret1 = await scrapePageForContactInfo(page);
            
            await page.close();
            page = await browser.newPage();

            await page.goto(`https://www.perfectgame.org/Events/TournamentSchedule.aspx?event=${csvRecords[0][i][1]}`, {waitUntil: 'domcontentloaded', timeout: 15000});
            let ret = await scrapePage(page, ret1);

            result.push('');
            result.push(ret);
            result.push('\n');

            // write to the csv file
            let csv = result.join();
            fs.appendFileSync("data/output/backlink-report.csv", csv);
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