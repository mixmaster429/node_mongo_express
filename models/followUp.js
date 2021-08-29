var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    school_id: {
        type: String,
        default: ''
    },
    follow_through: String,
    remarks: String,
    next_follow_date: Date,
    status: String,
    inquiry_status: String,
    student_id: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('FollowUpModel', schema);