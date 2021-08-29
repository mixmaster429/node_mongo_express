var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    school_id: {type: String, default: ''},
    name: String,
    academic_year_id: String,
    start_date: String,
    end_date: String,
    is_default: Number,
    notes: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {},
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('SessionModel', schema);
