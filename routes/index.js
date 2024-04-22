var express = require('express');
var router = express.Router();
var questionController = require('../controllers/questionController.js');

/* GET home page. */
router.get('/', questionController.list);

module.exports = router;