var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    name:String,
    template_body:String,
    user_id: String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('CurriculumTemplateModel', schema);