var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    address_1:String,
    address_2:String,
    zip_code:String,
    description:String,
    max_student:Number,
    title:String,
    isDeleted:{default:false,type:Boolean},
    created_by:{},
    created_at: Date,
    updated_at: Date,
    updated_by: {}
    
});

module.exports = mongoose.model('LocationModel', schema);
