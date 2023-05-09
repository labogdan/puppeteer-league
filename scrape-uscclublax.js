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
/*result.push(
  ", URL, Name, isSecure, Sport"
);*/

async function processUrl(url, page) {
  console.log(`processing ${url}`);

  if (url === 'https://www.usclublax.com/association_info.php?a=') {
    return [];
  }
  //await page.waitForSelector('title', {timeout: 5000});  

  let retVal = []
  let orgName = await page.title();
  
  //console.log(1);
  await page.waitForSelector('.table.table-sm.table-striped');
  //console.log(2);


  let items = await page.evaluate(() => {
    console.log(' hwere we are');
    console.log(document.querySelector('.table.table-sm.table-striped'));

    let list = document.querySelectorAll('.table.table-sm.table-striped tr')
    console.log(list);

    let listOfItems = [];

    let count = document.querySelector('.desc-container-table table tbody').childElementCount;
    //console.log(count);

    listOfItems.push(count);

    [...document.querySelector('.table.table-sm.table-striped').childNodes[0].childNodes].map((item) => {
      if (item.nodeType === 1){
          console.log(item.childNodes[1].textContent);
          listOfItems.push(item.childNodes[1].textContent);
      }
    });

    [...document.querySelector('.table.table-sm.table-striped').childNodes[0].childNodes[6].childNodes[1].childNodes].map( (item) => {
      if (item.nodeType === 1) {
        listOfItems.push(item.href)
      }
    });

    console.log(listOfItems);
    return listOfItems;
    });

  console.log(items);
  [...items].map( (item) => {
    console.log(item);
  })
  
  
  retVal.push([items]);

  return retVal;
  
  console.info(retVal);
}

/*

await Promise.all([
  page.waitForNavigation(),
  page.click('a')
]);

*/

(async () => {

  await readData();

  let iteration = 0;
  console.log('warming up');
  const browser = await puppeteer.launch({ headless: true });
  console.log('spawned browser');

  for (i = 0; i < csvRecords[0].length; i++) {
    
    const page = await browser.newPage();
    console.log('spawned new page');
  

    page.on('console', async (msg) => {
      const msgArgs = msg.args();
      for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
      }
    });

    console.log('run: %o', i);
    console.log(csvRecords[0][i][0]);

    try {
      await page.goto(`${csvRecords[0][i][0]}`, {waitUntil: 'domcontentloaded', timeout: 5000}); //{waitUntil: 'load', timeout: 5000});
      let res = await processUrl(csvRecords[0][i][0], page);

      let singleResult = [];
      singleResult.push("\n");
      singleResult.push(res);

      console.log(3);
      result.push("\n");
      result.push(res);
      console.log('processed!');
      fs.appendFileSync("data/output/backlink-report.csv", singleResult.join());  
      iteration = 0;
    } catch(e) {
      if (iteration < 4) {
        i--;
        iteration++;
        console.warn('not found - incrementing iteration: %o', iteration);
      } else {
        console.warn('not found - giving up',);
        console.log(e);
        result.push("\n");
        result.push(csvRecords[0][i][0]);
        result.push("error opening web page");
        iteration = 0;
      }
    }
    wait(1000);
    try {
      await page.close();
    } catch(e) {
      console.warn(e);
    }
    wait(1000);
    
  }


  await browser.close();
  /*let csv = result.join();
  fs.appendFileSync("data/output/backlink-report.csv", csv);
  console.log(result);*/
  
})();