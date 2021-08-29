var mongoose = require('mongoose');

var schema = mongoose.Schema({
    group_name: String,
    academic_year: String,
    frequency: String,
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('FeeGroupModel', schema);
