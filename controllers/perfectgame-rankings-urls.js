const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
let INPUT_URL = ``;
let OUTPUT_FILE = 'data/output/perfectgame-ranking-urls.csv';
let idMap = [391, 392, 393, 394, 396, 368, 372, 377, 384, 390];

let csvRecords = [];
let result = [];

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('.travelteam', {timeout: 5000});
  let retVal = await page.evaluate(() => {    
    let returnValue = [''];
    let elems = [...document.querySelectorAll('.travelteam')];

    
    let ranks = [...elems[0].querySelectorAll('tr td table tr td span[id^="ContentTopLevel_ContentPlaceHolder1_repRankings_lblRank"]')];
    let teams = [...elems[0].querySelectorAll('tr td table tr td a[id^="ContentTopLevel_ContentPlaceHolder1_repRankings_hlTeamName"]')];

    for (let i = 0; i < ranks.length; i++) {
        returnValue.push(ranks[i].innerText);
        returnValue.push(',');
        returnValue.push(teams[i].innerText);
        returnValue.push(',');
        returnValue.push(teams[i].href);
        returnValue.push('\n');
    }


    ranks = [...elems[1].querySelectorAll('tr td table tr td span[id^="ContentTopLevel_ContentPlaceHolder1_repNationalHM_lblRank"]')];
    teams = [...elems[1].querySelectorAll('tr td table tr td a[id^="ContentTopLevel_ContentPlaceHolder1_repNationalHM_hlTeamName"]')];

    for (let i = 0; i < ranks.length; i++) {
        returnValue.push(ranks[i].innerText);
        returnValue.push(',');
        returnValue.push(teams[i].innerText);
        returnValue.push(',');
        returnValue.push(teams[i].href);
        returnValue.push('\n');
    }

    
    return returnValue;
  });
console.log(retVal);
  return retVal;
}

function inputURL(id) {
  return `https://www.perfectgame.org/rankings/team/Default.aspx?R=${id}`
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
    //await readData();
    console.log('warming up');
    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
        //slowMo: 100
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

    
    
    for (i = 0; i < idMap.length; i++) {
      await page.goto(inputURL(idMap[i]), {waitUntil: 'domcontentloaded', timeout: 15000}); //{waitUntil: 'load', timeout: 5000});
        try {
            let ret = await scrapePage(page, idMap[i]);
            result.push(ret);
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


exports.perfectgameRankingsUrls = async (req, res, next) => {
    try {
        console.log('perfectgameUrls');
        await init();
        res.send({msg: 'ok'});
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
};