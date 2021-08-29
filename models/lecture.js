var mongoose = require('mongoose');

var schema = mongoose.Schema({
    school_id: {type: String, default: ''},
    class_room_id: String,
    class_room_ids: {},
    endTime:{},
    session_id:String,
    end_time:Date,
    lecture_date:Date,
    notes:String,
    standard_grade_id:String,
    startTime:{},
    start_time:Date,
    subject_id:String,
    user_id:String,    
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('LectureModel', schema);
