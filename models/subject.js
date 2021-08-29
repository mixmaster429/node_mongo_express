var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    name: String,
    department: String,
    grade: String,
    type: String,
    description: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {},
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('SubjectModel', schema);
