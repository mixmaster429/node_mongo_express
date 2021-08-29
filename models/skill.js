var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    itemName: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {},
  
});

module.exports = mongoose.model('SkillModel', schema);
