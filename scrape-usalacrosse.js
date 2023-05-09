const puppeteer = require('puppeteer');
const fs = require("fs");

const sports = [
  'Soccer',
  'Field Hockey',
  'Hockey',
  'Basketball',
  'Baseball',
  'Softball',
  'Lacrosse',
  'Football'
]

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
}

let csvRecords = [];

async function readData() {
  const readStream = fs.readFileSync('data/input/urls.csv', {
    encoding: 'utf8',
  });
  
  csvRecords.push(
    readStream.split(/\r?\n/).map((line) => {
        return line.split(',');
    })
  );  
}
  
let result = [];

async function setUpPage(page) {

  /*await page.waitForSelector('.filter-container', {timeout: 5000});  
  await page.$eval('input#program-zipcode', el => el.value = '24012');
  await page.select('select#program-distance', 'All');
  
  await page.evaluate(() => {
    console.log(document.querySelector('input#program-zipcode').value);
    console.log(document.querySelector('select#program-distance').value);
  });*/

  await page.click('button#program-search');
  console.log('clicked first area');

}

async function scrapePage(url, page) {
  console.log(`processing ${url}`);

  await page.waitForSelector('.filter-items');
  let retVal = await page.evaluate(() => {    
    let returnValue = [''];
    [...document.querySelector('.filter-items').childNodes].map((item) => { 
      if (item.nodeType === 1) {
        let base = item.childNodes[1].childNodes[3].childNodes[1];
          let line1 = base.childNodes[1].childNodes;
          [...line1].map((item) => {
              if (item.nodeType === 1 ) {
                  returnValue.push(item.innerText);
              }
          });
          if (line1.length !== 5) {
              returnValue.push('');
          }

          let line2 = base.childNodes[3];
          returnValue.push(line2.innerText);

          let line3 = item.childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[1].textContent;
          returnValue.push(line3);

          let line4 = item.childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[7] ? item.childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes[7].childNodes[0].href : null;
          returnValue.push(line4);

          returnValue.push('\n')

      }
    });
    return returnValue;
  });

  return retVal;
}

async function paginate(page) {
  await wait(1000);
  page.waitForSelector('.pager__item--next .secondary-btn');
  await page.click('.pager__item--next .secondary-btn');
  console.log('clicked pagination');
}


(async () => {

  await readData();
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

  await page.goto(`${csvRecords[0][0][0]}`, {waitUntil: 'domcontentloaded', timeout: 5000}); //{waitUntil: 'load', timeout: 5000});
  await setUpPage(page);
    
  for (i = 0; i < 250; i++) {
    console.log('run: %o', i);
    console.log(csvRecords[0][0][0]);

    try {
      await paginate(page);

      let ret = await scrapePage(csvRecords[0][0][0], page);
      //console.log(ret);

      let singleResult = [];
      singleResult.push("\n");
      result.push(ret);
      let csv = result.join();
      fs.appendFileSync("data/output/backlink-report.csv", csv);
      result = [];
    } catch(e) {
      console.error(e);
    }
  }
  await page.close();
  await browser.close();
  
})();