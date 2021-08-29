var mongoose = require('mongoose');


var immunizationSchema = mongoose.Schema({
  itemName:String,
  created_at:Date,
  created_by:{},
  updated_at:Date,
  updated_by:{}
})

module.exports = mongoose.model('ImmunizationModel', immunizationSchema);