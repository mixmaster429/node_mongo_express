var ExamModel = require('../models/exam');
var ClassModel = require('../models/class');
var SchoolGradesModel = require('../models/schoolGrades');
const { saveActivity } = require('./activityUtil');


class examController {
    async getBaseData(req, res) {
        try {
            let { school_id } = req.headers
            let classes = await ClassModel.find({ school_id: school_id });
            let school_grades = await SchoolGradesModel.find({ school_id: school_id });

            res.json({status: true, result: {
                classes: classes,
                school_grades: school_grades,
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async getExams(req, res) {
        try {
            let { school_id } = req.headers
            let exams = await ExamModel.find({ school_id: school_id });

            res.json({status: true, result: {
                exams: exams
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async getExam(req, res) {
        try {
            let { id } = req.params
            let exam = await ExamModel.findOne({_id: id})

            res.json({status: true, result: exam})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async createExam(req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let data = req.body
        data['school_id'] = school_id;
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        let item = await ExamModel.create(data);
        saveActivity(user_id, user_name, "Exam", "New Exam has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async updateExam(req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['school_id'] =  school_id;
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await ExamModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Exam", "An Exam has been updated.", "Updated");
        let exams = await ExamModel.find({ school_id: school_id })
        res.json({status: true, result: exams})
    }

    async deleteExam(req, res) {
        let { id } = req.params
        let { user_id, user_name, school_id } = req.headers;
        await ExamModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Exam", "An Exam has been deleted.", "Deleted");
        let exams = await ExamModel.find({ school_id: school_id })
        res.json({status: true, result: exams})
    }
}

module.exports = examController;