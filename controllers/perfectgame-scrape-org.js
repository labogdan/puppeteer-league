const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let csvRecords = [];

async function readData() {
  const readStream = fs.readFileSync('data/input/perfectgame-urls2.csv', {
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
  await page.waitForSelector('#ContentTopLevel_ContentPlaceHolder1_lblTeamHomeTown', {timeout: 10000});
  let data = [''];

let hometown = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblTeamHomeTown').textContent;
  });

  let totalTeams = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblTotalTeams').textContent;
  });

  let pgTopFinishesNumber = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblChampionship').childNodes[0].textContent;
  });

  let pgTopFinishesDetails = await page.evaluate(() => {
    return document.querySelector('#ContentTopLevel_ContentPlaceHolder1_lblChampionship').childNodes[2].textContent;
  });
    
    data.push(previousData);
    data.push(hometown);
    data.push(totalTeams);
    data.push(pgTopFinishesNumber);
    data.push(pgTopFinishesDetails);

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
            fs.appendFileSync("data/output/perfectgame-export.csv", csv);
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


exports.perfectgameScrapeOrg = async (req, res, next) => {
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