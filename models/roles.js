var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    name: String,
    description: String,
    weight: Number,
    school_id: { type: String, default: "" },
    moduleData: {},
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('RoleModel', schema);
