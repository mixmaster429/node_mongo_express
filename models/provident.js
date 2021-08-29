var mongoose = require('mongoose');

var schema = mongoose.Schema({
    employee_id: String,
    provident_type: String,
    employee_share: Number,
    organization_share: Number,
    employee_share_percent: Number,
    organization_share_percent: Number,
    description: String,
    status: Boolean,
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('ProvidentModel', schema);
