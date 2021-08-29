var mongoose = require('mongoose');

var schema = mongoose.Schema({
    policy_name: String,
    description: String,
    department: String,
    file: String,
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('PolicyModel', schema);
