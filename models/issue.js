var mongoose = require('mongoose');

var schema = mongoose.Schema({
    allocated_user_id: String,
    created_at: Date,
    user_id: String,  // creater id
    description: String,
    issue_image: {
        type: String,
        default: ''
    },
    media: Object,
    school_id: Number,
    status: Number,
    title: String,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('IssueModel', schema);
