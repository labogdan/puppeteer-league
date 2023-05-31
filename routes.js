const express = require('express');

const usaFieldHockey = require('./controllers/usaFieldHockey');
const perfectgameUrls = require('./controllers/perfectgame-urls');
const perfectgameScrape = require('./controllers/perfectgame-scrape');
const perfectgameScrapeExtraInfo = require('./controllers/perfectgame-scrape-extra');
const perfectgameScrapeOrg = require('./controllers/perfectgame-scrape-org');

const router = express.Router();

router.get('/usafieldhockey', usaFieldHockey.usaFieldHockey);
router.get('/perfectgame-urls', perfectgameUrls.perfectgameUrls);
router.get('/perfectgame-scrape', perfectgameScrape.perfectgameScrape);
router.get('/perfectgame-scrape-extra', perfectgameScrapeExtraInfo.perfectgameScrapeExtraInfo);
router.get('/perfectgame-scrape-org', perfectgameScrapeOrg.perfectgameScrapeOrg);

module.exports = router;
