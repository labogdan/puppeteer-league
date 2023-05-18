const puppeteer = require('puppeteer');
const fs = require("fs");

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
}

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

  let state = record[1]? record[1].replace(' ',''): null;
  let zip = record[2]? record[2].replace(' ',''): null;

  if (state === null || zip === null) {
    return;
  }

  console.log('state: %o',state);
  console.log('zip: %o',zip);
  await page.waitForSelector('#CompanyState', {timeout: 5000});
  await page.select('#CompanyState', state);
  await page.select('select[name="geo_Miles"]', '200');
  await page.evaluate((zip) => {
    document.querySelector('input[name="geo_Zip"]').value = zip;
  }, zip);
  await page.click('button.submit');

  console.log('clicked first area');
}

async function scrapePage(record, page) {
  console.log(`processing ${record}`);

  await page.waitForSelector('#wp_Clubs-1', {timeout: 5000});
  let retVal = await page.evaluate((record) => {    
    let returnValue = [''];

    let name = record[0]? record[0].replace(' ',''): null;
    let state = record[1]? record[1].replace(' ',''): null;
    let zip = record[2]? record[2].replace(' ',''): null;

    
    
    [...document.querySelectorAll('.row.filterable.justify-content-left .display-card-parent')].map((item) => { 
      if (item.nodeType === 1) {

          returnValue.push(name);
          returnValue.push(state);
          returnValue.push(zip);

          let base = item.childNodes[0];
          let line1;

          if (base.childNodes[1].childNodes[0].childNodes[1]) {
            line1 = base.childNodes[1].childNodes[0].childNodes[1].textContent;
          } else {
            line1 = base.childNodes[1].textContent;
          }
          returnValue.push(line1);

          let line2 = [];
          [...base.childNodes[2].childNodes].map((node) => {
              if (node.nodeType === 3) {
                  line2.push(node.textContent);
              } else if (node.nodeType !== 3 && node.textContent.length) {
                line2.push(node.textContent);
              }
          });
          returnValue.push(line2);


          returnValue.push('\n');

      }
    });
    
    return returnValue;
  }, record);
console.log(retVal);
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

  await page.goto(`https://usafieldhockey.webpoint.us/wp15/Companies/Clubs.wp`, {waitUntil: 'domcontentloaded', timeout: 5000}); //{waitUntil: 'load', timeout: 5000});
    
  for (i = 0; i < csvRecords[0].length; i++) {

    await setUpPage(page,csvRecords[0][i]);

    try {
      //await paginate(page);

      let ret = await scrapePage(csvRecords[0][i], page);
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