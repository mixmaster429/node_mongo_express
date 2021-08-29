var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var engine = require('ejs-locals');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var router = require('./routes');
var app = express();
var cors = require('cors');


const PATH = './uploads';
if (!fs.existsSync(PATH)) {
  fs.mkdirSync(PATH);
}

const MONGOURL = process.env.MONGODB_URI;

mongoose.connect(MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  console.error(err || `Connected to MongoDB: ${MONGOURL}`);
});

// view engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(logger('dev'));
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({
  limit: '500mb', extended: false }));
app.use(bodyParser.json({
  limit: '500mb', extended: true
}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));

app.use('/api', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json({ status: false, message: 'Invalid Request.' })
});


module.exports = app;
