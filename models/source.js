var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    title: String,
    notes: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {},
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('SourceModel', schema);
