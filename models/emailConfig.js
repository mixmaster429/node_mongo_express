var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    user_id: String,
    hostName: String,
    serverIp: String,
    port: Number,
    userName: String,
    password: String,
    senderMail: String,
    senderName: String,
    enableSSL: Boolean,
    isDefault: Boolean,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('EmailConfigsModel', schema);
