var mongoose = require('mongoose');

var schema = mongoose.Schema({
    // id: String,
    user_id: String,
    bankName: String,
    bankCode: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('BankDetailsModel', schema);