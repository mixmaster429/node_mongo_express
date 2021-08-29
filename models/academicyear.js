var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    school_id: {type: String, default: ""},
    name: String,
    start_date: String,
    end_date: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('AcademicYearModel', schema);
