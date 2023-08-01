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
const calsouth = require('./controllers/calsouth');
const selectbaseballteamsUrls = require('./controllers/selectbaseballteams-urls');
const selectbaseballteamsUrlsRankings = require('./controllers/selectbaseballteams-urls-rankings');
const selectbaseballteamsUrlsTeams = require('./controllers/selectbaseballteams-urls-teams');
const selectbaseballteamsFinalData = require('./controllers/selectbaseballteams-final-data');
const ntxsoccerUrls = require('./controllers/ntxsoccer-urls');
const perfectgameRankingsUrls = require('./controllers/perfectgame-rankings-urls');
const perfectgameRankingsOrg = require('./controllers/perfectgame-rankings-org');
const perfectgameRankingsFinal = require('./controllers/perfectgame-rankings-final');
const coloradosoccer = require('./controllers/coloradosoccer');
const nmysa = require('./controllers/nmysa');
const georgiasoccer = require('./controllers/georgiasoccer');
const exposureEventsUrls = require('./controllers/exposureevents-urls');
const exposureEventsFinal = require('./controllers/exposureevents-final');
const idahoyouthsoccer = require('./controllers/idahoyouthsoccer');
const southdakotasoccer = require('./controllers/southdakotasoccer');
const utahyouthsoccer = require('./controllers/utahyouthsoccer');

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
router.get('/calsouth', calsouth.calsouth);
router.get('/selectbaseballteams-urls', selectbaseballteamsUrls.selectbaseballteamsUrls);
router.get('/selectbaseballteams-urls-rankings', selectbaseballteamsUrlsRankings.selectbaseballteamsUrlsRankings);
router.get('/selectbaseballteams-urls-teams', selectbaseballteamsUrlsTeams.selectbaseballteamsUrlsTeams);
router.get('/selectbaseballteams-final-data', selectbaseballteamsFinalData.selectbaseballteamsFinalData);
router.get('/ntxsoccer-urls', ntxsoccerUrls.ntxsoccerUrls);
router.get('/perfectgame-rankings-urls', perfectgameRankingsUrls.perfectgameRankingsUrls);
router.get('/perfectgame-rankings-org', perfectgameRankingsOrg.perfectgameRankingsOrg);
router.get('/perfectgame-rankings-final', perfectgameRankingsFinal.perfectgameRankingsFinal);
router.get('/coloradosoccer', coloradosoccer.coloradosoccer);
router.get('/nmysa', nmysa.nmysa);
router.get('/georgiasoccer', georgiasoccer.georgiasoccer);
router.get('/exposureevents-urls', exposureEventsUrls.exposureEventsUrls);
router.get('/exposureevents-final', exposureEventsFinal.exposureEventsFinal);
router.get('/idahoyouthsoccer', idahoyouthsoccer.idahoyouthsoccer);
router.get('/southdakotasoccer', southdakotasoccer.southdakotasoccer);
router.get('/utahyouthsoccer', utahyouthsoccer.utahyouthsoccer);

module.exports = router;
