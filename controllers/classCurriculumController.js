var AccountModel = require('../models/account');
var classCurriculumModel = require('../models/classCurriculum');
var classModel = require('../models/class');
var academicyearModel = require('../models/academicyear');
var sessionModel = require('../models/session');
var gradeModel = require('../models/schoolGrades');
var subjectModel = require('../models/subject');
var userModel = require('../models/users');
var templateModel = require('../models/curriculum');
const { saveActivity,getDateRange } = require('./activityUtil');
const e = require('express');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class ClassCurriculumController {
    async getClassCurriculum (req, res) {
        let { user_id } = req.headers
        let { _id } = req.params
       // let class = 
        let classcurriculum = await classCurriculumModel.findOne({_id})

        res.json({status: true, result: classcurriculum})
    }

    async searchClassCurriculum (req, res) {
        let { user_id } = req.headers
       let data = req.body;
        data['created_by.user_id'] = user_id
        let result={},days
        let class_days = []
        let exist = false
        let classcurriculum = await classCurriculumModel.find(data)
      //  let classcurriculum = []
      //console.log(data.session_id)
      let classResult = await classModel.findOne({_id:ObjectId(data.class_id)})
      let session = await sessionModel.findOne({_id:ObjectId(classResult.session_id)})
    //  console.log(session)

      let academic_year = await academicyearModel.findOne({_id:ObjectId(data.academic_year_id)})
     
      let grade = await gradeModel.findOne({_id:ObjectId(classResult.standard_grade_id)})
      let subject = await subjectModel.findOne({_id:ObjectId(classResult.subject_id)})
      let teacher = await userModel.findOne({user_id:classResult.user_id})
     // let teacher = await userModel.findOne({user_id:classResult.user_id})
      let template={}
        if(classcurriculum.length==0){
      //  let classResult = await classModel.findOne({_id:"605912a5b03bac1bdcb63b74"})
       
      //  let academicyear = await academicyearModel.findOne({_id:"601d293cee919c3ed0f2ee5f"})
        let academicyear = await academicyearModel.findOne({_id:data.academic_year_id})
        classResult.class_days.map(class_day=>{
            class_days.push(class_day.itemName)
        })
      //  console.log(class_days)
      //  console.log(moment().format('MM/DD/YYYY'))
        let ddates = await getDateRange(new Date(academicyear.start_date),new Date(academicyear.end_date),class_days)
        
            result = {datesData:ddates,dateFormat:'',template,session,academic_year,class:classResult,grade,subject,teacher}
     
    
      
        }
        else{
            template = await templateModel.findOne({_id:ObjectId(classcurriculum[0].curriculum_template_id)})
            
            result = {datesData:classcurriculum[0].datesData,template,dateFormat:classcurriculum[0].dateFormat,session,academic_year,class:classResult,grade,subject,teacher}
            // console.log(result)
            // result["session"]=session
            // console.log(result)
            // result["academic_year"]=academic_year
            // result["class"]=classResult
            // result["grade"]=grade
            // result["subject"]=subject
            // result["teacher"]=teacher
            exist = true
        }
      //  console.log(result)

        res.json({status: true, result,exist})
    }

    async addClassCurriculum(req,res){
        let { user_id, user_name } = req.headers;
        let data = req.body;
        console.log(data)
        data['created_at'] =  Date.now(),
        data['created_by'] =  {
            user_id: user_id,
            user_name: user_name
        }

    await classCurriculumModel.create(data);
    saveActivity(user_id, user_name, "ClassCurriculum", "New ClassCurriculum has been created.", "Created");
    res.json({ status: true });
}
async updateClassCurriculum(req,res){
    let { user_id, user_name } = req.headers;
    let data = req.body;
    let id = data["id"]
    delete data["id"]

    data['updated_at'] =  Date.now(),
    data['updated_by'] =  {
        user_id: user_id,
        user_name: user_name
    }
    await classCurriculumModel.updateOne({ _id: id }, { $set:data});


saveActivity(user_id, user_name, "ClassCurriculum", "ClassCurriculum has been updated.", "Updated");
res.json({ status: true });
}

async deleteClassCurriculum(req, res) {
    let { id } = req.params;
    let { user_id, user_name } = req.headers;
    await classCurriculumModel.deleteOne({ _id: id });
    saveActivity(user_id, user_name, "classCurriculum", "A classCurriculum has been deleted.", "Deleted");
    res.json({ status: true });
}


}


module.exports = ClassCurriculumController;