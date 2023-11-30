const puppeteer = require('puppeteer');
const fs = require("fs");
const utils = require('../utils');

let INPUT_FILE = '';
//let INPUT_URL = 'https://www.kansasyouthsoccer.org/';
let OUTPUT_FILE = 'data/output/kansasyouthsoccer-urls.csv';
 let csvRecords = ['district-i', 'district-ii', 'district-iii', 'district-iv', 'district-v'];

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
};

let result = [];

function inputURL(urlSlug) {
  return `https://www.kansasyouthsoccer.org/${urlSlug}/`
}

async function scrapePage_i(page, record, socket) {
  console.log('scraping page');
  socket.send(`scraping page i`);

  await page.waitForSelector('.grid_9.push_3.main-rail div.block', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    
    let elems = document.querySelectorAll('.grid_9.push_3.main-rail div.block');

    console.log(elems);

    let leagueMembers = elems[5]?.querySelectorAll('table td');
    leagueMembers.forEach((member)=>{
        let name = member.querySelector('u')?.innerText || '';
        let href = member.querySelector('a')?.href || '';
        returnValue.push(record);
        returnValue.push(',');
        returnValue.push(name);
        returnValue.push(',');
        returnValue.push(href);
        returnValue.push('\n');
    });

    let registrarMembers = elems[7]?.querySelectorAll('table td');
    registrarMembers.forEach((column)=>{
        let members = column.querySelectorAll('a');
        members.forEach((registrarMember)=>{
            let name = registrarMember?.innerText || '';
            let href = registrarMember?.href || '';
            returnValue.push(record);
            returnValue.push(',');
            returnValue.push(name);
            returnValue.push(',');
            returnValue.push(href);
            returnValue.push('\n');
        });
    });
    
    let clubMembers = elems[9].querySelectorAll('td');
    clubMembers.forEach((clubMember)=>{
        let name = clubMember.querySelector('u')?.innerText || '';
        let href = clubMember.querySelector('a')?.href || '';
        returnValue.push(record);
        returnValue.push(',');
        returnValue.push(name);
        returnValue.push(',');
        returnValue.push(href);
        returnValue.push('\n');
    });
    
    return returnValue;
  }, record);
  console.log(retVal);
  return retVal;
}

async function scrapePage_ii(page, record, socket) {
  console.log('scraping page');
  socket.send(`scraping page ii`);

  await page.waitForSelector('.grid_9.push_3.main-rail div.block', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    
    let elems = document.querySelectorAll('.grid_9.push_3.main-rail div.block');

    console.log(elems);

    let leagueMembers = elems[5]?.querySelectorAll('table td a');
    leagueMembers.forEach((member)=>{
      let name = member.innerText;
      let href = member.href;
      returnValue.push(record);
      returnValue.push(',');
      returnValue.push(name);
      returnValue.push(',');
      returnValue.push(href);
      returnValue.push('\n');
    });
    
    let clubMembers = elems[7].querySelectorAll('td');
    clubMembers.forEach((clubMember)=>{
        let name = clubMember.querySelector('u')?.innerText || '';
        let href = clubMember.querySelector('a')?.href || '';
        returnValue.push(record);
        returnValue.push(',');
        returnValue.push(name);
        returnValue.push(',');
        returnValue.push(href);
        returnValue.push('\n');
    });
    
    return returnValue;
  }, record);
  console.log(retVal);
  return retVal;
}

async function scrapePage_iv(page, record, socket) {
  console.log('scraping page');
  socket.send(`scraping page iv`);

  await page.waitForSelector('.grid_9.push_3.main-rail div.block', {timeout: 15000});
  console.log('found results');

  let retVal = await page.evaluate( async (record) => {
    let returnValue = [''];
    
    let elems = document.querySelectorAll('.grid_9.push_3.main-rail div.block');
        
    let clubMembers = elems[4].querySelectorAll('td');
    clubMembers.forEach((clubMember)=>{
        let name = clubMember.querySelector('u')?.innerText || '';
        let href = clubMember.querySelector('a')?.href || '';
        returnValue.push(record);
        returnValue.push(',');
        returnValue.push(name);
        returnValue.push(',');
        returnValue.push(href);
        returnValue.push('\n');
    });

    console.log(returnValue)
    
    return returnValue;
  }, record);
  console.log(retVal);
  return retVal;
}

async function init (socket) {
    console.log('init');
    //await readData();
    console.log('warming up');
    const browser = await utils.initChrome(socket);
    console.log('spawned browser');

    const page = await browser.newPage();
    console.log('spawned new page');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
        try {console.log(await msgArgs[i].jsonValue());} catch (e) {}
        }
    });

    for (i = 0; i < csvRecords.length; i++) {
      console.log(inputURL(csvRecords[i]));
      await page.goto(inputURL(csvRecords[i]), {waitUntil: 'domcontentloaded', timeout: 15000});
      try {
        switch (csvRecords[i]) {
          case 'district-i':
            var scrapePage = scrapePage_i;
            socket.send(`percentComplete:${20}`);
            break;
          case 'district-ii':
            var scrapePage = scrapePage_ii;
            socket.send(`percentComplete:${30}`);
            break;
          case 'district-iii':
            var scrapePage = scrapePage_ii;
            socket.send(`percentComplete:${40}`);
            break;
          case 'district-iv':
            var scrapePage = scrapePage_iv;
            socket.send(`percentComplete:${50}`);
            break;
          case 'district-v':
            var scrapePage = scrapePage_ii;
            socket.send(`percentComplete:${60}`);
            break;
          default:
            var scrapePage = scrapePage_i;
            socket.send(`percentComplete:${70}`);
        }
        let ret = await scrapePage(page, csvRecords[i], socket);
        let csv = ret.join();
        fs.appendFileSync(OUTPUT_FILE, csv);
      } catch(e) {
        console.error('there was an error');
        console.error(e);
      }
    }
    
    socket.send(`percentComplete:${80}`);
    

    await page.close();
    await browser.close();
}

exports.kansasyouthsoccer = async (socket) => {
    try {
        console.log('kansasyouthsoccer');
        socket.send(`percentComplete:${10}`);
        await init(socket);
        socket.send(`percentComplete:${100}`);
        socket.send('Scrape Complete!');
      } catch (error) {
        console.error('there was an error');
        console.error(error);
        socket.send('error');
      }
};