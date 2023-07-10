const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = 'data/output/perfectgame-ranking-org.csv';
let INPUT_URL = '';
let OUTPUT_FILE = 'data/output/perfectgame-ranking-final.csv';
// let idMap = [391, 392, 393, 394, 396, 368, 372, 377, 384, 390];

let csvRecords = [];
let result = [];

async function scrapePage(page, previousData) {
  console.log('scraping page');
  let data = [];

  await page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_lblTeamHomeTown', {timeout: 10000});
  
  let hometown = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblTeamHomeTown').textContent;
  });

  let topFinishes = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblChampionship').childNodes[0].textContent;
  });

  let topFinishesDetails = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblChampionship').childNodes[2].textContent;
  });
  
  data.push(previousData);
  data.push(hometown);
  data.push(topFinishes);
  data.push(topFinishesDetails);

  console.log(data);

  return data;
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
    csvRecords = await utils.readData(INPUT_FILE);
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

    const page = await browser.newPage();
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
            let ret = await scrapePage(page, csvRecords[0][i]);

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


exports.perfectgameRankingsFinal = async (req, res, next) => {
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