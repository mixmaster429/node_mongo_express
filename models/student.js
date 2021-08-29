var mongoose = require('mongoose');

var schema = mongoose.Schema({
    image:String,
    first_name:String,
    last_name:String,
    middle_name:String,
    email:String,
    phone:String,
    birth_date:Date,
    inquiry_date:Date,
    gender_id:String,
    standard_grade_id:String,
    academic_year_id:String,
    session_id:String,
    school_id:String,

   // user_id:String,
   source:String,
   source_details:String,
   parent_name:String,
   parent_phone:String,
   parent_address:String,
   parent_email:String,
   address:{},
   description:String,
   social_info:String,
   medical:{},
   inquiry_status_id:String,
   is_confirm:{type:String,default:"0"},
   created_at: Date,
   updated_at: Date,
   created_by: {},
   updated_by: {}
  
});

module.exports = mongoose.model('StudentModel', schema);
