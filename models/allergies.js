var mongoose = require('mongoose');


var allergySchema = mongoose.Schema({
  itemName:String,
  created_at:Date,
  created_by:{},
  updated_at:Date,
  updated_by:{}
})

module.exports = mongoose.model('AllergyModel', allergySchema);