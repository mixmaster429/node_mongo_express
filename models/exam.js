var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    class_ids: [],
    title: String,
    grade_id: String,
    session_id: String,
    type: String,
    grade_type: String,
    total_score: Number,
    start_time: {},
    end_time: {},
    publish_date: Date,
    result_date: Date,
    notes: String,
    is_published: {type: Boolean, default: false},
    clone_status: {type: Boolean, default: false},
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('ExamModel', schema);
