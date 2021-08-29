var express = require('express');
var router = express.Router();
var todosController = require('../controllers/todosController');
var todos = new todosController();

router.post('/save', todos.save);
router.get('/load', todos.load);


module.exports = router;