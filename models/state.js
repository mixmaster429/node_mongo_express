var mongoose = require('mongoose');


var stateSchema = mongoose.Schema({
  name:String,
  countryId:String,
  created_at:Date,
  created_by:{},
  updated_at:Date,
  updated_by:{}
})

module.exports = mongoose.model('StateModel', stateSchema);