var mongoose = require('mongoose');

var schema = mongoose.Schema({
    staff_id: String,
    net_salary: Number,
    basic: Number,
    tds: Number,
    da: Number,
    esi: Number,
    hra: Number,
    pf: Number,
    conveyance: Number,
    leave: Number,
    allowance: Number,
    prof_tax: Number,
    medical_allowance: Number,
    labour_walfare: Number,
    others_earnings: [],
    others_deduction: [],
    created_by: {},
    updated_by: {},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('PayrollSalaryModel', schema);
