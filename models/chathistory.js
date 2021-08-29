var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    room: String,
    text: String,
    date: Date,
    reply: Boolean,
    user: {},
    files: []
});

module.exports = mongoose.model('ChatHistory', schema);
