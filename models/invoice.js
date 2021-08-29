var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    invoice_number: String,
    client: String,
    project: {type: mongoose.Schema.Types.ObjectId, ref: "FeeHeadModel"},
    email: String,
    tax: {type: mongoose.Schema.Types.ObjectId, ref: "TaxModel"},
    client_address: String,
    billing_address: String,
    invoice_date: Date,
    expiry_date: Date,
    items: [],
    discount: Number,
    description: String,
    status: Number,
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('InvoiceModel', schema);
