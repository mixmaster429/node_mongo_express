var express = require('express');
var router = express.Router();
var todosController = require('../controllers/todosController');
var todos = new todosController();

router.get('/todos', todos.download);

module.exports = router;