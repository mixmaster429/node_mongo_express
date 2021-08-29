var mongoose = require('mongoose');

var schema = mongoose.Schema({
    issue_id: {type: mongoose.Schema.Types.ObjectId, ref: "IssueModels"},
    user_id: String,  // creater id
    user: Object,
    message: String,
    title: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('CommnetModel', schema);
