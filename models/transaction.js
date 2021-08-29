var mongoose = require('mongoose');

var schema = mongoose.Schema({
    buyer: {},
    seller: String,
    type: String,
    item_id: String,
    price: Number,
    title: String,
    created_at: Date,
});

module.exports = mongoose.model('TransactionModel', schema);
