const express = require('express');

const usaFieldHockey = require('./controllers/usaFieldHockey');
const perfectgameUrls = require('./controllers/perfectgame-urls');
const perfectgameScrape = require('./controllers/perfectgame-scrape');
const perfectgameScrapeExtraInfo = require('./controllers/perfectgame-scrape-extra');
const perfectgameScrapeOrg = require('./controllers/perfectgame-scrape-org');
const prepbaseballreportUrls = require('./controllers/prepbaseballreport-urls');
const prepbaseballreportUrlsAPI = require('./controllers/prepbaseballreport-urls-api');
const prepbaseballreportTeams = require('./controllers/prepbaseballreport-teams');
const prepbaseballreportSocial = require('./controllers/prepbaseballreport-social');
const washingtonyouthsoccer = require('./controllers/washingtonyouthsoccer');
const azsoccerassociation = require('./controllers/azsoccerassociation');

const router = express.Router();

router.get('/usafieldhockey', usaFieldHockey.usaFieldHockey);
router.get('/perfectgame-urls', perfectgameUrls.perfectgameUrls);
router.get('/perfectgame-scrape', perfectgameScrape.perfectgameScrape);
router.get('/perfectgame-scrape-extra', perfectgameScrapeExtraInfo.perfectgameScrapeExtraInfo);
router.get('/perfectgame-scrape-org', perfectgameScrapeOrg.perfectgameScrapeOrg);
router.get('/prepbaseballreport-urls', prepbaseballreportUrls.prepbaseballreportUrls);
router.get('/prepbaseballreport-urls-api', prepbaseballreportUrlsAPI.prepbaseballreportUrlsAPI);
router.get('/prepbaseballreport-teams', prepbaseballreportTeams.prepbaseballreportTeams);
router.get('/prepbaseballreport-social', prepbaseballreportSocial.prepbaseballreportSocial);
router.get('/washingtonyouthsoccer', washingtonyouthsoccer.washingtonyouthsoccer);
router.get('/azsoccerassociation', azsoccerassociation.azsoccerassociation);

module.exports = router;
