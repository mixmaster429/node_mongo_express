var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ""},
    class_days: [],
    class_type: String,
    credit:Number,
    end_time: {},
    location_id:{type: mongoose.Schema.Types.ObjectId, ref: "LocationModels", default: ""},
    location_room_id:{type: mongoose.Schema.Types.ObjectId, ref: "RoomModels", default: ""},
    max_student:Number,
    name:String,
    notes:String,
    session_id: {type: mongoose.Schema.Types.ObjectId, ref: "SessionModels"},
    standard_grade_id: {type: mongoose.Schema.Types.ObjectId, ref: "SchoolGradesModels"},    
    start_time: {},
    subject_id: {type: mongoose.Schema.Types.ObjectId, ref: "SubjectModels"},
    syllabus: String,
    user_id: String,
    cloned_on:Date,
    cloned:{type:Number,default:0},
    isCloned:{type:Number,default:0},
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('ClassModel', schema);
