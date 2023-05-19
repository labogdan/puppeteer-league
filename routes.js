const express = require('express');

const usaFieldHockey = require('./controllers/usaFieldHockey');

const router = express.Router();

router.get('/usafieldhockey', usaFieldHockey.usaFieldHockey);

module.exports = router;
