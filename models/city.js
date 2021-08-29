var mongoose = require('mongoose');


var citySchema = mongoose.Schema({
  name:String,
  stateId:String,
  created_at:Date,
  created_by:{},
  updated_at:Date,
  updated_by:{}
})

module.exports = mongoose.model('CityModel', citySchema);