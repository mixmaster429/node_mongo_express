var mongoose = require('mongoose');

var schema = mongoose.Schema({
    type: String,
    item: {},
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('PayrollItemModel', schema);
