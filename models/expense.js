var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    item_name: String,
    purchase_from: String,
    purchase_date: Date,
    purchased_by: String,
    amount: Number,
    paid_by: String,
    status: String,
    confirm_files: [],
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('ExpenseModel', schema);
