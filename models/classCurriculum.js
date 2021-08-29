var mongoose = require('mongoose');

var schema = mongoose.Schema({
    name:String,
    academic_year_id:String,
    dateFormat: String,
    class_id:String,
    datesData:[],
    curriculum_template_id:String,
    session_id:String,
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('classCurriculumModel', schema);


