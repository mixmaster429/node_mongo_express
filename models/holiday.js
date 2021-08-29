var mongoose = require('mongoose');

var schema = mongoose.Schema({
    academic_year_id: String,
    session_id: String,
    school_id: String,
    holiday_date: String,
    name: String,
    note: String,
    external_url: {type: String, default: ''},
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('HolidayModel', schema);
