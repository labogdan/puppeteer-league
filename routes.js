const express = require('express');

const usaFieldHockey = require('./controllers/usaFieldHockey');
const perfectgameUrls = require('./controllers/perfectgame-urls');
const perfectgameScrape = require('./controllers/perfectgame-scrape');

const router = express.Router();

router.get('/usafieldhockey', usaFieldHockey.usaFieldHockey);
router.get('/perfectgame-urls', perfectgameUrls.perfectgameUrls);
router.get('/perfectgame-scrape', perfectgameScrape.perfectgameScrape);

module.exports = router;
