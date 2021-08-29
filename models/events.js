var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    user_id: String,
    access: String,
    for_parent: Boolean,
    for_student: Boolean,
    title: String,
    start_date: String,
    end_date: String,
    address1: String,
    zipcode: String,
    content: String,
    notes: String,
    school_id: { type: String, default: "" },
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('eventsModel', schema);
