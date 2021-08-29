var mongoose = require('mongoose');

var schema = mongoose.Schema({
    name: String,
    scales: [],
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('GradingModel', schema);