var mongoose = require('mongoose');

var schema = mongoose.Schema({
    name: String,
    school_id: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('AppointmentAboutModel', schema);
