var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    user_id: String,
    event_id: String,
    name: String,
    email: String,
    mobile: String,
    message: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('eventRegistrationModel', schema);
