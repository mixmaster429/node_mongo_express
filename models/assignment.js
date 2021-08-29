var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    user_id:String,
    session_id:String,
    standard_grade_id:String,
    subject_id:String,
    homework_grade_id:String,
    class_room_id:String,
    title:String,
    description:String,
    due_date:Date,
    visible_date:Date,
    class_room_ids:{},
    start_time:Date,
    end_time:Date,
    exam_grade_id:String,
    grade_scale_type:String,
    teacher_id:String,
    marks:Number,
    cloned_on:Date,
    isCloned:{default:0,type:Number},
    cloned:{default:0,type:Number},
    bookLink:{default:'',type:String},
    materialLink:{default:'',type:String},
    files:{default:[],type:Array},
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
  
});

module.exports = mongoose.model('AssignmentModel', schema);
