var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    head_name: String,
    academic_year: String,
    assign_group: String,
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('FeeHeadModel', schema);
