var express = require('express');
var router = express.Router();
var AuthorizePayment = require('../controllers/authorize');
var account = new AuthorizePayment();

router.post('/charge', account.chargeCreditCard);
module.exports = router;