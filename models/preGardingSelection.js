var mongoose = require('mongoose');

var schema = mongoose.Schema({
    id: String,
    userid: String,
    created_at: Date,
    updated_at: Date,
    preGardData: {}
});

module.exports = mongoose.model('PreGardingModel', schema);
