var express = require('express');
var router = express.Router();
var AccountController = require('../controllers/accountController');
var account = new AccountController();

router.get('/authorizes', account.getAccounts);
router.get('/authorize', account.getAccount);
router.post('/authorize', account.registerAccount);
router.delete('/authorize/:id', account.deleteAccount);

router.get('/transaction', account.getTransactions);

module.exports = router;