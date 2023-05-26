const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let csvRecords = [];

async function readData() {
  const readStream = fs.readFileSync('data/input/usafieldhockey-urls.csv', {
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

async function scrapePage(page) {
  console.log('scraping page');

  await page.waitForSelector('.rgMasterTable', {timeout: 5000});
  let retVal = await page.evaluate(() => {    
    let returnValue = [''];
    
    /*let item = document.querySelector('.rgRow').childNodes[3].childNodes[1].href.split('event=')[1];
    returnValue.push(item);
    returnValue.push('\n');*/

    console.warn('row1');
    document.querySelectorAll('.rgRow').forEach((row) => {
      //console.log(row.childNodes[3].childNodes[1].href.split('event=')[1]);
      returnValue.push(row.childNodes[3].childNodes[1].href.split('event=')[1]);
      returnValue.push('\n');
    });

    console.warn('row2');
    document.querySelectorAll('.rgAltRow').forEach((row) => {
      //console.log(row.childNodes[3].childNodes[1].href.split('event=')[1]);
      returnValue.push(row.childNodes[3].childNodes[1].href.split('event=')[1]);
      returnValue.push('\n');
    });
    
    return returnValue;
  });
console.log(retVal);
  return retVal;
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
        headless: false,
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

    await page.goto(`https://www.perfectgame.org/schedule/?Type=Tournaments`, {waitUntil: 'domcontentloaded', timeout: 15000}); //{waitUntil: 'load', timeout: 5000});
    
    await paginate(page);
    await paginate(page);
    await paginate(page);

    for (i = 3; i < 15; i++) {
        try {
            let ret = await scrapePage(page);
            let singleResult = [];
            singleResult.push("\n");
            result.push(`page: ${i}`);
            result.push('\n');
            result.push(ret);
            let csv = result.join();
            fs.appendFileSync("data/output/backlink-report.csv", csv);
            result = [];
            utils.wait(2000);
            await paginate(page);
        } catch(e) {
            console.error('there was an error');
            console.error(e);
        }
    }
    await page.close();
    await browser.close();
}


exports.perfectgameUrls = async (req, res, next) => {
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