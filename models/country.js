var mongoose = require('mongoose');


var countrySchema = mongoose.Schema({
  name:String,
  created_at:Date,
  created_by:{},
  updated_at:Date,
  updated_by:{}
})

module.exports = mongoose.model('CountryModel', countrySchema);