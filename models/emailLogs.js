var mongoose = require('mongoose');

var schema = mongoose.Schema({
    user_id: String,
    user_name: String,
    from: String,
    to: String,
    template: String,
    status: String,
    subject: String,
    errorMessage: String,
    sendDate: Date
});

module.exports = mongoose.model('EmailLogsModel', schema);
