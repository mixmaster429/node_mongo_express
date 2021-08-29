var mongoose = require('mongoose');

var schema = mongoose.Schema({
    user_id: String,
    user_name: String,
    logged_at: Date,
    module_name: String,
    log_name: String,
    description: String
});

module.exports = mongoose.model('ActivityLogsModel', schema);
