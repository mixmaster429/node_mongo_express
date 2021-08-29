var mongoose = require('mongoose');

var schema = mongoose.Schema({
   
  name:String
  
});

module.exports = mongoose.model('homeworkgrades', schema);
