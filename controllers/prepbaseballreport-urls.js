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

  let retVal = await page.evaluate(() => {    
    let returnValue = [''];
    
    document.querySelectorAll('eventslist .list-container .list-details').forEach((row) => {
      //console.log(row.childNodes[3].childNodes[1].href.split('event=')[1]);
      returnValue.push(row.childNodes[3].childNodes[1].href.split('event=')[1]);
      returnValue.push('\n');
    });
    
    return returnValue;
  });
console.log(retVal);
  return retVal;
}

async function scrollToBottomOfPage(page) {
  await page.evaluate(async () => {
    await new Promise(async (resolve, reject) => {
      let totalHeight = 0;
      let distance = 4000;
      let timer = setInterval(async () => {
        console.log('scrolling');
        console.log(document.querySelectorAll('#eventslist .list-container').length);
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        await utils.wait(1000);
        
        if(totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  });
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
    await page.setViewport({
      width: 1500,
      height: 1300,
      deviceScaleFactor: 1,
    });

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
        }
    });

    await page.goto(`https://tournaments.prepbaseballreport.com/`, {waitUntil: 'domcontentloaded', timeout: 15000}); //{waitUntil: 'load', timeout: 5000});
    await page.waitForSelector('#eventslist', {timeout: 5000});
    console.log('loaded page');
    await scrollToBottomOfPage(page);
    console.log('scrolled to bottom of page');

    let results = await scrapePage(page);
    let csv = results.join();
    fs.appendFileSync("data/output/prepbaseballreport-export.csv", csv);


    /*for (i = 0; i < 1; i++) {
        try {
            let ret = await scrapePage(page);
            let singleResult = [];
            singleResult.push("\n");
            result.push(`page: ${i}`);
            result.push('\n');
            result.push(ret);
            let csv = result.join();
            fs.appendFileSync("data/output/perfectgame-export.csv", csv);
            result = [];
            utils.wait(2000);
            await paginate(page);
        } catch(e) {
            console.error('there was an error');
            console.error(e);
        }
    }*/
    await page.close();
    await browser.close();
}


exports.prepbaseballreportUrls = async (req, res, next) => {
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