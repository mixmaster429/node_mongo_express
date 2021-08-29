const AcademicYearModel = require('../models/academicyear');
const SessionModel = require('../models/session');
const SchoolGradesModel = require('../models/schoolGrades');
const SubjectTypeModel = require('../models/subjectType');
const DepartmentModel = require('../models/department');
const SubjectModel = require('../models/subject');
const SourceModel = require('../models/source');
const RoleModel = require('../models/roles');
const RoomModel = require('../models/room');
const LocationModel = require('../models/location');
const EmailConfigModel = require('../models/emailConfig');
const EmailTemplateModel = require('../models/emailTemplate');
const SmsTemplateModel = require('../models/smsTemplate');
const SmsLogsModel = require('../models/smsLogs');
const User = require('../models/users');
const ClassModel = require('../models/class');
const BankDetailsModel = require('../models/bankDetails');
const PreGardingModel = require('../models/preGardingSelection');
const ImmunizationModel = require('../models/immunization');
const AllergyModel = require('../models/allergies');
const CountryModel = require('../models/country');
const StateModel = require('../models/state');
const CityModel = require('../models/city');
const GradingModel = require('../models/grading');
const crypto = require('crypto');
const {
    saveActivity
} = require('./activityUtil');
const {
    getEmailLogs
} = require('./mailUtil');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const db = require("../db").queries;

class setupController {

    async getSubjectsByGrade(req, res) {
        let {
            grade
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;


        let subjects = await SubjectModel.find({
            grade: grade
        })

        res.json({
            status: true,
            subjects
        });


    }

    async getClassesBySubject(req, res) {
        let {
            subject
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;


        let classes = await ClassModel.find({
            subject_id: ObjectId(subject).toString()
        })

        res.json({
            status: true,
            classes
        });


    }

    async getAllStudentsUnassignedAndAssigned(req, res) {
        let {
            grade,
            classId
        } = req.body;
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;



        try {

            let lookUp = {};
            let unwindSession = {};

            let lookUp1 = {};
            let unwindGrades = {};

            let lookUp2 = {};
            let unwindYear = {};

            let lookUp3 = {};
            let unwindClass = {}
            let role = await RoleModel.find({
                weight: 5,
                school_id: school_id
            })
            if (role.length == 0) {
                res.json({
                    status: false,
                    message: "Cannot find student role"
                })
                return
            }

            let match = {
                $match: {
                    role_id: ObjectId(role[0]._id).toString(),
                    standard_grade_id: grade,
                    class_id: classId,
                }
            }

            let addFields = {
                "$addFields": {
                    "sessionObjectId": {
                        "$toObjectId": "$session_id"
                    }
                }
            }
            lookUp = {
                $lookup: {
                    from: "sessionmodels",
                    localField: "sessionObjectId",
                    foreignField: "_id",
                    as: "sessionData"
                }
            };

            unwindSession = {
                $unwind: {
                    path: "$sessionData",
                    preserveNullAndEmptyArrays: true
                }
            };


            let addFields1 = {
                "$addFields": {
                    "gradeObjectId": {
                        "$toObjectId": "$standard_grade_id"
                    }
                }
            }

            lookUp1 = {
                $lookup: {
                    from: "schoolgradesmodels",
                    localField: "gradeObjectId",
                    foreignField: "_id",
                    as: "gradesData"
                }
            };

            unwindGrades = {
                $unwind: {
                    path: "$gradesData",
                    preserveNullAndEmptyArrays: true
                }
            };



            let addFields2 = {
                "$addFields": {
                    "yearObjectId": {
                        "$toObjectId": "$academic_year_id"
                    }
                }
            }

            lookUp2 = {
                $lookup: {
                    from: "academicyearmodels",
                    localField: "yearObjectId",
                    foreignField: "_id",
                    as: "yearData"
                }
            };

            unwindYear = {
                $unwind: {
                    path: "$yearData",
                    preserveNullAndEmptyArrays: true
                }
            };


            let addFields3 = {
                "$addFields": {
                    "classObjectId": {
                        "$toObjectId": "$class_id"
                    }
                }
            }

            lookUp3 = {
                $lookup: {
                    from: "classmodels",
                    localField: "classObjectId",
                    foreignField: "_id",
                    as: "classData"
                }
            };

            unwindClass = {
                $unwind: {
                    path: "$classData",
                    preserveNullAndEmptyArrays: true
                }
            };


            let project = {
                "$project": {
                    "_id": 1,
                    "personal_info": 1,
                    "logo_image": 1,
                    "email": 1,
                    "grade": 1,
                    // "type":1,
                    "session": 1,
                    "year": 1,
                    "class": 1,

                }
            }

            let group = {
                $group: {
                    _id: "$_id",
                    personal_info: {
                        $first: "$personal_info"
                    },
                    logo_image: {
                        $first: "$logo_image"
                    },
                    email: {
                        $first: "$email"
                    },


                    session: {
                        $first: "$sessionData"
                    },
                    year: {
                        $first: "$yearData"
                    },
                    class: {
                        $first: "$classData"
                    },
                    //     type: {$first: "$subjectTypeData"},
                    grade: {
                        $first: "$gradesData"
                    },




                }
            };

            let query = [
                match,
                addFields,
                lookUp,
                unwindSession,
                addFields1,
                lookUp1,
                unwindGrades,
                addFields2,
                lookUp2,
                unwindYear,
                addFields3,
                lookUp3,
                unwindClass,

                group,
                project
            ];

            let assigned = await db.aggregateData(User, query);

            let unAssigned = await User.find({
                role_id: role[0]._id,
                standard_grade_id: grade,
                $or: [{
                    class_id: null
                }, {
                    class_id: ""
                }]
            })

            res.json({
                status: true,
                unAssigned: unAssigned,
                assigned: assigned
            });
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async assignStudentsToClass(req, res) {
        let {
            data,
            class_id
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;

        await User.updateMany({
            class_id: class_id
        }, {
            $set: {

                class_id: "",
                updated_at: Date.now(),
                updated_by: {
                    name: user_name,
                    user_id: user_id
                }
            }
        });



        for (var i = 0; i < data.length; i++) {
            await User.updateOne({
                _id: ObjectId(data[i].student_id).toString()
            }, {
                $set: {

                    class_id,
                    updated_at: Date.now(),
                    updated_by: {
                        name: user_name,
                        user_id: user_id
                    }
                }
            });
        }



        res.json({
            status: true
        });


    }



    // Academic Year CRUD functions
    async addAcademicYear(req, res) {
        let {
            name,
            start_date,
            end_date
        } = req.body;
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        try {
            await AcademicYearModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                school_id: school_id,
                name: name,
                start_date: start_date,
                end_date: end_date,
                created_at: Date.now(),
                created_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            })
            saveActivity(user_id, user_name, "Academic Year", "New Academic Year has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }

    }

    async editAcademicYear(req, res) {
        let {
            id,
            name,
            start_date,
            end_date
        } = req.body;
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        try {
            await AcademicYearModel.updateOne({
                _id: id
            }, {
                school_id: school_id,
                name: name,
                start_date: start_date,
                end_date: end_date,
                updated_at: Date.now(),
                updated_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            });
            saveActivity(user_id, user_name, "Academic Year", "Academic Year has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async getAcademicYear(req, res) {
        let {
            user_id,
            school_id,
            user_role
        } = req.headers;
        try {
            let result = await AcademicYearModel.find({
                school_id: school_id
            });
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async deleteAcademicYear(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await AcademicYearModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Academic Year", "An Academic Year has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    // Session CRUD functions
    async addSession(req, res) {
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        try {
            await SessionModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                school_id: school_id,
                name: req.body.name,
                academic_year_id: req.body.academic_year_id,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                is_default: req.body.is_default,
                notes: req.body.notes,
                created_at: Date.now(),
                created_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            })
            saveActivity(user_id, user_name, "School Session", "A Session has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async editSession(req, res) {
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        try {
            await SessionModel.updateOne({
                _id: req.body.id
            }, {
                school_id: school_id,
                name: req.body.name,
                academic_year_id: req.body.academic_year_id,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                is_default: req.body.is_default,
                notes: req.body.notes,
                updated_at: Date.now(),
                updated_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            });
            saveActivity(user_id, user_name, "School Session", "School session has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async getSessions(req, res) {
        let {
            school_id
        } = req.headers
        let sessions = await SessionModel.find({
            school_id: school_id
        });
        let result = [];
        for (let i = 0; i < sessions.length; i++) {
            let academic_year = await AcademicYearModel.findOne({
                _id: ObjectId(sessions[i].academic_year_id).toString()
            }).j(true);
            let d = JSON.parse(JSON.stringify(sessions[i]));
            if (!academic_year) {

            } else {
                d.academic_year = academic_year.name;
                result.push(d);
            }
        }

        res.json({
            status: true,
            result: result
        });
    }

    async getSession(req, res) {

        let {
            academic_year_id
        } = req.params;
        let result = await SessionModel.find({
            academic_year_id: academic_year_id
        });
        res.json({
            status: true,
            result: result
        });
    }

    async changeSessionStatus(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        let session = await SessionModel.findOne({
            _id: id
        });
        session.active = !session.active;
        await session.save();
        saveActivity(user_id, user_name, "School Session", "School session has been updated.", "Updated");
        res.json({
            status: true
        });
    }

    async deleteSession(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        await SessionModel.deleteOne({
            _id: id
        });
        saveActivity(user_id, user_name, "School Session", "A School Session has been deleted.", "Deleted");
        res.json({
            status: true
        });
    }

    // School Grades CRUD functions
    async addSchoolGrades(req, res) {
        let {
            name,
            position,
            notes
        } = req.body;
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        try {
            await SchoolGradesModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                school_id: school_id,
                name: name,
                position: position,
                notes: notes,
                created_at: Date.now(),
                created_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            })
            saveActivity(user_id, user_name, "School", "New School Grade has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }

    }

    async editSchoolGrades(req, res) {
        let {
            id,
            name,
            position,
            notes
        } = req.body;
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        try {
            await SchoolGradesModel.updateOne({
                _id: id
            }, {
                school_id: school_id,
                name: name,
                position: position,
                notes: notes,
                updated_at: Date.now(),
                updated_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            });
            saveActivity(user_id, user_name, "School", "School Grades has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async getSchoolGrades(req, res) {
        let {
            school_id
        } = req.headers
        try {
            let result = await SchoolGradesModel.find({
                school_id: school_id
            });
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async deleteSchoolGrades(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SchoolGradesModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "School", "A School Grade has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    // Subject Type CRUD functions
    async addSubjectType(req, res) {
        let {
            name,
            notes
        } = req.body;
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        try {
            await SubjectTypeModel.create({
                school_id: school_id,
                name: name,
                notes: notes,
                created_at: Date.now(),
                created_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            })
            saveActivity(user_id, user_name, "Subject Type", "New Subject Type has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }

    }

    async editSubjectType(req, res) {
        let {
            id,
            name,
            notes
        } = req.body;
        let {
            user_id,
            user_name,
            school_id
        } = req.headers;
        try {
            await SubjectTypeModel.updateOne({
                _id: id
            }, {
                school_id: school_id,
                name: name,
                notes: notes,
                updated_at: Date.now(),
                updated_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            });
            saveActivity(user_id, user_name, "Subject Type", "Subject Type has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async getSubjectType(req, res) {
        let {
            school_id
        } = req.headers;
        try {
            let result = await SubjectTypeModel.find({
                school_id: school_id 
            });
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async deleteSubjectType(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SubjectTypeModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Subject Type", "A Subject Type has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    // Department CRUD functions
    async addDepartment(req, res) {
        let {
            name,
            description
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await DepartmentModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                name: name,
                description: description,
                created_at: Date.now(),
                created_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            })
            saveActivity(user_id, user_name, "Department", "New Department has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }

    }

    async editDepartment(req, res) {
        let {
            id,
            name,
            description
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await DepartmentModel.updateOne({
                _id: id
            }, {
                name: name,
                description: description,
                updated_at: Date.now(),
                updated_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            });
            saveActivity(user_id, user_name, "Department", "Department has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async getDepartment(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let result = await DepartmentModel.find({
                'created_by.user_id': user_id
            });
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async deleteDepartment(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await DepartmentModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Department", "A Department has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    // Subject CRUD functions
    async addSubject(req, res) {
        let {
            name,
            department,
            grade,
            type,
            description
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SubjectModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                name: name,
                department: department,
                grade: grade,
                type: type,
                description: description,
                created_at: Date.now(),
                created_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            })
            saveActivity(user_id, user_name, "Subject", "New Subject has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }

    }

    async editSubject(req, res) {
        let {
            id,
            name,
            department,
            grade,
            type,
            description
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SubjectModel.updateOne({
                _id: id
            }, {
                name: name,
                department: department,
                grade: grade,
                type: type,
                description: description,
                updated_at: Date.now(),
                updated_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            });
            saveActivity(user_id, user_name, "Subject", "Subject has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async getSubject(req, res) {
        let {
            user_id
        } = req.headers;
        try {

            let lookUp = {};
            let unwindDepartment = {};

            let lookUp1 = {};
            let unwindGrades = {};

            let lookUp2 = {};
            let unwindType = {};


            let match = {
                $match: {
                    //role_id: "776425a6489a5dea266da9e928b9fe08", // static for now will change
                    //  role_id: ObjectId(role._id).toString(), // static for now will change
                    'created_by.user_id': user_id
                }
            }

            let addFields = {
                "$addFields": {
                    "departmentObjectId": {
                        "$toObjectId": "$department"
                    }
                }
            }
            lookUp = {
                $lookup: {
                    from: "departmentmodels",
                    localField: "departmentObjectId",
                    foreignField: "_id",
                    as: "departmentData"
                }
            };

            unwindDepartment = {
                $unwind: {
                    path: "$departmentData",
                    preserveNullAndEmptyArrays: true
                }
            };


            let addFields1 = {
                "$addFields": {
                    "gradeObjectId": {
                        "$toObjectId": "$grade"
                    }
                }
            }

            lookUp1 = {
                $lookup: {
                    from: "schoolgradesmodels",
                    localField: "gradeObjectId",
                    foreignField: "_id",
                    as: "gradesData"
                }
            };

            unwindGrades = {
                $unwind: {
                    path: "$gradesData",
                    preserveNullAndEmptyArrays: true
                }
            };



            let addFields2 = {
                "$addFields": {
                    "typeObjectId": {
                        "$toObjectId": "$type"
                    }
                }
            }

            lookUp2 = {
                $lookup: {
                    from: "subjecttypemodels",
                    localField: "typeObjectId",
                    foreignField: "_id",
                    as: "subjectTypeData"
                }
            };

            unwindType = {
                $unwind: {
                    path: "$subjectTypeData",
                    preserveNullAndEmptyArrays: true
                }
            };


            let project = {
                "$project": {
                    "_id": 1,
                    "description": 1,
                    "name": 1,
                    "grade": 1,
                    "type": 1,
                    "department": 1,

                }
            }

            let group = {
                $group: {
                    _id: "$_id",
                    description: {
                        $first: "$description"
                    },
                    name: {
                        $first: "$name"
                    },


                    department: {
                        $first: "$departmentData"
                    },
                    type: {
                        $first: "$subjectTypeData"
                    },
                    grade: {
                        $first: "$gradesData"
                    },




                }
            };

            let query = [
                match,
                addFields,
                lookUp,
                unwindDepartment,
                addFields1,
                lookUp1,
                unwindGrades,
                addFields2,
                lookUp2,
                unwindType,

                group,
                project
            ];

            let result = await db.aggregateData(SubjectModel, query);
            res.json({
                status: true,
                result: result
            });


            // let result = await SubjectModel.find({'created_by.user_id': user_id});
            // res.json({ status: true, result: result });
        } catch (error) {
            console.log(error)
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async deleteSubject(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SubjectModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Subject", "A Subject has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    // Source CRUD functions
    async addSource(req, res) {
        let {
            title,
            notes
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SourceModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                title: title,
                notes: notes,
                created_at: Date.now(),
                created_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            })
            saveActivity(user_id, user_name, "Source", "New Source has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }

    }

    async editSource(req, res) {
        let {
            id,
            title,
            notes
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SourceModel.updateOne({
                _id: id
            }, {
                title: title,
                notes: notes,
                updated_at: Date.now(),
                updated_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            });
            saveActivity(user_id, user_name, "Source", "Source has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async getSource(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let result = await SourceModel.find({
                'created_by.user_id': user_id
            });
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async deleteSource(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SourceModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Source", "A Source has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    // Role CRUD functions
    async addRole(req, res) {
        let {
            name,
            description,
            weight,
            moduleData
        } = req.body;
        let {
            user_id,
            user_name,
            user_role,
            school_id
        } = req.headers;
        let role = await RoleModel.findOne({
            _id: user_role
        });
        if (role && role.weight > weight) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
            return
        }
        try {
            await RoleModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                name: name,
                description: description,
                weight: weight,
                moduleData: moduleData,
                school_id: school_id,
                created_at: Date.now(),
                created_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            })
            saveActivity(user_id, user_name, "Role", "New Role has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }

    }

    async editRole(req, res) {
        let {
            id,
            name,
            description,
            weight,
            moduleData
        } = req.body;
        let {
            user_id,
            user_name,
            user_role,
            school_id
        } = req.headers;
        console.log('editRole ', school_id)
        let role = await RoleModel.findOne({
            _id: user_role
        });
        if (role && role.weight > weight) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
            return
        }
        try {
            await RoleModel.updateOne({
                _id: id
            }, {
                name: name,
                description: description,
                weight: weight,
                moduleData: moduleData,
                school_id: school_id,
                updated_at: Date.now(),
                updated_by: {
                    name: req.headers.user_name,
                    user_id: req.headers.user_id
                }
            });
            saveActivity(user_id, user_name, "Role", "Role has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async getStaffRolesBySchoolId(req, res) {
        let {
            user_role,
            user_id,
            school_id
        } = req.headers
        let role = await RoleModel.findOne({
            _id: user_role
        });
        let result = await RoleModel.find({
            weight: {
                $nin: [0, 1, 2, 3, 5, 6],
                $gt: role.weight
            },
            $or: [{
                school_id: school_id
            }, {
                "created_by.user_id": user_id
            }]
        });

        res.json({
            status: true,
            result: result
        });
    }

    async getStaffRolesBySchool(req, res) {
        let {
            user_role,
            school_id
        } = req.headers
        let role = await RoleModel.findOne({
            _id: user_role
        });

        let result = await RoleModel.find({
            $and: [{
                weight: {
                    $nin: [0, 1, 2, 3, 5, 6]
                },
                weight: {
                    $gt: role.weight
                }
            }],
            school_id: school_id
        });
        // console.log(result)

        res.json({
            status: true,
            result: result
        });
    }

    async getStaffRolesUnderSchoolsDistrict(req, res) {
        let {
            school_id
        } = req.headers

        let result = await RoleModel.find({
            $and: [{
                weight: {
                    $ne: 5
                }
            }, {
                weight: {
                    $ne: 6
                }
            }, {
                weight: {
                    $gt: 3
                }
            }],
            school_id: school_id
        });

        res.json({
            status: true,
            result: result
        });
    }

    async getRoles(req, res) {
        let {
            user_role,
            school_id
        } = req.headers

        try {
            let result = []
            let role = await RoleModel.findOne({
                _id: user_role
            });
            // console.log(role)
            if (role.weight === 0) {

                result = await RoleModel.find({
                    weight: {
                        $in: [1, 3]
                    },
                    school_id: school_id 
                });
            } else if (role) {
                if (role.weight <= 3) {
                    result = await RoleModel.find({
                        weight: {
                            $gt: role.weight
                        },
                        school_id: school_id 
                    });
                } else if (!isNaN(role.weight + 1)) {
                    result = await RoleModel.find({
                        weight: (role.weight + 1),
                        school_id: school_id
                    });
                }
            }
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async getRole(req, res) {
        let {
            id
        } = req.params;
        let result = await RoleModel.findOne({
            _id: id
        });
        res.json({
            status: true,
            result: result
        });
    }

    async deleteRole(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await RoleModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Role", "A Role has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    // Room functions

    async addRoom(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        let data = req.body
        data['created_at'] = Date.now()
        data['created_by'] = {
            name: req.headers.user_name,
            user_id: req.headers.user_id
        };


        try {
            await RoomModel.create(data)
            saveActivity(user_id, user_name, "Room", "New Room has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }

    async editRoom(req, res) {

        let {
            user_id,
            user_name
        } = req.headers;
        let id = req.body.id
        let data = req.body;
        delete data['id']

        data['updated_at'] = Date.now()
        data['updated_by'] = {
            name: req.headers.user_name,
            user_id: req.headers.user_id
        };

        try {
            await RoomModel.updateOne({
                _id: id
            }, data);
            saveActivity(user_id, user_name, "Room", "Room has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }

    }

    // Email Configuration CRUD functions
    async addEmailConfig(req, res) {
        let {
            hostName,
            serverIp,
            port,
            userName,
            password,
            senderMail,
            senderName,
            enableSSL,
            isDefault
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await EmailConfigModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                user_id: user_id,
                hostName: hostName,
                serverIp: serverIp,
                port: port,
                userName: userName,
                password: password,
                senderMail: senderMail,
                senderName: senderName,
                enableSSL: enableSSL,
                isDefault: isDefault,
                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Email Configuration", "New Email Configuration has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }

    async editEmailConfig(req, res) {
        let {
            id,
            hostName,
            serverIp,
            port,
            userName,
            password,
            senderMail,
            senderName,
            enableSSL,
            isDefault
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await EmailConfigModel.updateOne({
                _id: id
            }, {
                hostName: hostName,
                serverIp: serverIp,
                port: port,
                userName: userName,
                password: password,
                senderMail: senderMail,
                senderName: senderName,
                enableSSL: enableSSL,
                isDefault: isDefault,
                updated_at: Date.now(),
                updated_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Email Configuration", "Email Configuration has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async getRooms(req, res) {
        let location_id = req.body.location_id
        let {
            user_id
        } = req.headers
        try {
            let result = await RoomModel.find({
                location_id: location_id
            });
            res.json({
                result,
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }
    async getEmailConfig(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            let user = await User.findOne({
                user_id: user_id
            });
            let role = await RoleModel.findOne({
                _id: user.role_id
            });
            let filterOption = {};
            if (role.name !== "Super Admin") {
                filterOption = {
                    user_id: user_id
                };
            }
            let result = await EmailConfigModel.find(filterOption);
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }

    async getLocationRemainingCapacity(req, res) {
        let {
            id
        } = req.params

        let location = await LocationModel.findOne({
            _id: id
        })
        let max_capacity = location.max_student


        let result = await RoomModel.aggregate(
            [{
                    $match: {
                        location_id: room.location_id
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        totalCapacity: {
                            $sum: "$room_capacity"
                        },

                    }
                }
            ]
        )
        let remaining_capacity = max_capacity - result[0].totalCapacity



        res.json({
            status: true,
            remaining_capacity
        });
    }

    async getRoom(req, res) {
        let {
            id
        } = req.params;
        let room = await RoomModel.findOne({
            _id: id
        });
        let location = await LocationModel.findOne({
            _id: room.location_id
        })
        let max_capacity = location.max_student


        let result = await RoomModel.aggregate(
            [{
                    $match: {
                        location_id: room.location_id
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        totalCapacity: {
                            $sum: "$room_capacity"
                        },

                    }
                }
            ]
        )
        let remaining_capacity = max_capacity - result[0].totalCapacity



        res.json({
            status: true,
            result: room,
            remaining_capacity
        });
    }

    async deleteRoom(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await RoomModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Room", "A Room has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }

    async deleteEmailConfig(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await EmailConfigModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Email Configuration", "An Email Configuration has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    // Email Tempalte CRUD functions
    async addEmailTemplate(req, res) {
        let {
            templateName,
            templateType,
            subject,
            isAutomation,
            content
        } = req.body;
        console.log(req.body);
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await EmailTemplateModel.create({
                id: crypto.randomBytes(16).toString("hex"),
                user_id: user_id,
                templateName,
                templateType,
                subject,
                isAutomation,
                content,
                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Email Template", "New Email Template has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }

    async editEmailTemplate(req, res) {
        let {
            id,
            templateName,
            templateType,
            subject,
            isAutomation,
            content
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await EmailTemplateModel.updateOne({
                id: id
            }, {
                templateName,
                templateType,
                subject,
                isAutomation,
                content,
                updated_at: Date.now(),
                updated_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Email Template", "Email Template has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async getEmailTemplates(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            let user = await User.findOne({
                user_id: user_id
            });
            let role = await RoleModel.findOne({
                id: user.role_id
            });
            let filterOption = {};
            if (role.name !== "Super Admin") {
                filterOption = {
                    user_id: user_id
                };
            }
            let result = await EmailTemplateModel.find(filterOption);
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async getEmailTemplate(req, res) {
        let {
            id
        } = req.params;
        try {
            let result = await EmailTemplateModel.find({
                id: id
            });
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async deleteEmailTemplate(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await EmailTemplateModel.deleteOne({
                id: id
            });
            saveActivity(user_id, user_name, "Email Template", "An Email Template has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    // Email Logs CRUD functions
    async getEmailLogs(req, res) {
        let emailLogs = await getEmailLogs(req);
        res.json({
            status: true,
            result: emailLogs
        });
    }

    // Sms Tempalte CRUD functions
    async addSmsTemplate(req, res) {
        let {
            templateName,
            templateType,
            isAutomation,
            content
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SmsTemplateModel.create({
                id: crypto.randomBytes(16).toString("hex"),
                user_id: user_id,
                templateName,
                templateType,
                isAutomation,
                content,
                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            })
            saveActivity(user_id, user_name, "Sms Template", "New Sms Template has been created.", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }

    async editSmsTemplate(req, res) {
        let {
            id,
            templateName,
            templateType,
            isAutomation,
            content
        } = req.body;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SmsTemplateModel.updateOne({
                id: id
            }, {
                templateName,
                templateType,
                isAutomation,
                content,
                updated_at: Date.now(),
                updated_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Sms Template", "Sms Template has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async getSmsTemplates(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            let user = await User.findOne({
                user_id: user_id
            });

            let role = await RoleModel.findOne({
              id: user.role_id
            });
            let filterOption = {};
            if (role && role.name !== "Super Admin") {
              filterOption = {
                user_id: user_id
              };
            }
            let result = await SmsTemplateModel.find(filterOption);
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async getSmsTemplate(req, res) {
        let {
            id
        } = req.params;
        try {
            let result = await SmsTemplateModel.find({
                id: id
            });
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async deleteSmsTemplate(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await SmsTemplateModel.deleteOne({
                id: id
            });
            saveActivity(user_id, user_name, "Sms Template", "An Sms Template has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    // Bank Detail CRUD functions
    async getSmsLogs(req, res) {
        try {
            let {
                user_role,
                user_id,
                school_id
            } = req.headers
            let role = await RoleModel.findOne({
                $or: [{
                    _id: user_role
                }, {
                    id: user_role
                }]
            });
            let smsLogs = []
            if (role) {
                if (role.weight === 0) {
                    let users = (await User.find({
                        role_id: {
                            $in: [1, 3]
                        }
                    }).select('user_id')).map((item) => item.user_id);
                    users.push(user_id)
                    smsLogs = await smsLogsModel.find({
                        user_id: {
                            $in: users
                        }
                    }).sort({
                        sendDate: -1
                    }).limit(1000);
                } else if (role.weight <= 3) {
                    let roles = (await RoleModel.find({
                        weight: {
                            $gt: role.weight
                        },
                        school_id: school_id 
                    }).select('_id')).map((item) => item._id);
                    let users = (await User.find({
                        role_id: {
                            $in: roles
                        },
                        school_id: school_id 
                    }).select('user_id')).map((item) => item.user_id);
                    users.push(user_id)
                    smsLogs = await smsLogsModel.find({
                        user_id: {
                            $in: users
                        }
                    }).sort({
                        sendDate: -1
                    }).limit(1000);
                } else if (!isNaN(role.weight + 1)) {
                    let roles = (await RoleModel.find({
                        weight: (role.weight + 1),
                        school_id: school_id 
                    }).select('_id')).map((item) => item._id);
                    let users = (await User.find({
                        role_id: {
                            $in: roles
                        },
                        school_id: school_id 
                    }).select('user_id')).map((item) => item.user_id);
                    users.push(user_id)
                    smsLogs = await smsLogsModel.find({
                        user_id: {
                            $in: users
                        }
                    }).sort({
                        sendDate: -1
                    }).limit(1000);
                }
            }

            res.json({
                status: true,
                result: smsLogs
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    // Bank Detail CRUD functions
    async addBankDetail(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        let {
            bankName,
            bankCode
        } = req.body;
        try {
            await BankDetailsModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                user_id: user_id,
                bankName: bankName,
                bankCode: bankCode,
                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Bank Detail", "New Bank Detail has been created", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }

    async editBankDetail(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        let {
            id,
            bankName,
            bankCode
        } = req.body;
        try {
            await BankDetailsModel.updateOne({
                _id: id
            }, {
                bankName: bankName,
                bankCode: bankCode,
                updated_at: Date.now(),
                updated_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Bank Detail", "Bank Detail has been updated.", "Updated");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }

    }



    async getBankDetail(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            let user = await User.findOne({
                user_id: user_id
            });
            let role = await RoleModel.findOne({
                _id: user.role_id
            });
            let filterOption = {};
            if (role.name !== "Super Admin") {
                filterOption = {
                    user_id: user_id
                };
            }
            let result = await BankDetailsModel.find(filterOption);
            res.json({
                status: true,
                result: result
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async deleteBankDetail(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await BankDetailsModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Bank Detail", "An Bank Detail has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async getPreGardingSelection(req, res) {
        try {
            let {
                user_id,
                user_name
            } = req.headers;
            let result = await PreGardingModel.findOne({
                userid: user_id
            });
            res.json({
                status: true,
                data: result
            });
        } catch {
            res.json({
                status: false,
                result: "something went wrong!"
            })
        }
    }

    async updatePreGardingSelection(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        let {
            data
        } = req.body;
        console.log(data);
        let result = await PreGardingModel.updateOne({
            userid: user_id
        }, {
            preGardData: data
        })
        res.json({
            status: true,
            data: result
        })
    }

    async getImmunizations(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let immunizations = await ImmunizationModel.find({});
            res.json({
                status: true,
                result: immunizations
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async deleteImmunization(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await ImmunizationModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Immunization", "An Immunization Detail has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async addImmunizations(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;

        try {
            await ImmunizationModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                //user_id: user_id,
                itemName: req.body.itemName,

                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Immunization", "New Immunization has been created", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }

    async getAllergies(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let allergies = await AllergyModel.find({});
            res.json({
                status: true,
                result: allergies
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async deleteAllegry(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await AllergyModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Allergy", "An Allergy Detail has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async addAllergy(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;

        try {
            console.log(req.body)
            await AllergyModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                //user_id: user_id,
                itemName: req.body.itemName,

                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Allergy", "New Allergy has been created", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }



    async getCountries(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let countries = await CountryModel.find({});
            res.json({
                status: true,
                result: countries
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async deleteCountry(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await CountryModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "Country", "A Country has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async addCountry(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;

        try {
            console.log(req.body)
            await CountryModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                //user_id: user_id,
                name: req.body.name,

                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Country", "New Country has been created", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }





    async getStates(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let states = await StateModel.find({
                countryId: req.params.country
            });
            res.json({
                status: true,
                result: states
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async deleteState(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await StateModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "State", "A State has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async addState(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;

        try {
            console.log(req.body)
            await StateModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                //user_id: user_id,
                name: req.body.name,
                countryId: req.body.country,

                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "State", "New State has been created", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }




    async getCities(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let cities = await CityModel.find({
                stateId: req.params.state
            });
            res.json({
                status: true,
                result: cities
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async deleteCity(req, res) {
        let {
            id
        } = req.params;
        let {
            user_id,
            user_name
        } = req.headers;
        try {
            await CityModel.deleteOne({
                _id: id
            });
            saveActivity(user_id, user_name, "City", "A City has been deleted.", "Deleted");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async addCity(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;

        try {
            console.log(req.body)
            await CityModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                //user_id: user_id,
                name: req.body.name,
                stateId: req.body.state,

                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "City", "New City has been created", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }


    async getSources(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let sources = await SourceModel.find({});
            res.json({
                status: true,
                result: sources
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }



    async addSources(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;

        try {
            await SourceModel.create({
                // _id: crypto.randomBytes(16).toString("hex"),
                //user_id: user_id,
                title: req.body.title,

                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Source", "New Source has been created", "Created");
            res.json({
                status: true
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }

    async getGradingScales(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let gradings = await GradingModel.find({});
            res.json({
                status: true,
                result: gradings
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async addGradingScales(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;

        try {
            let item = await GradingModel.create({
                name: req.body.name,
                created_at: Date.now(),
                created_by: {
                    name: user_name,
                    user_id: user_id
                }
            });
            saveActivity(user_id, user_name, "Grading", "New Grading has been created", "Created");
            res.json({
                status: true,
                result: item
            });
        } catch (error) {
            res.json({
                status: false,
                message: "Cannot proceed your request"
            });
        }
    }

    async updateGradingScales(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        let {
            id
        } = req.params;
        let data = req.body
        data['updated_at'] = Date.now();
        data['updated_by'] = {
            name: user_name,
            user_id: user_id
        };

        await GradingModel.updateOne({
            _id: id
        }, data);
        saveActivity(user_id, user_name, "Grading", "A Grading has been updated.", "Updated");
        let gradings = await GradingModel.find({})
        res.json({
            status: true,
            result: gradings
        })
    }

    async deleteGradingScales(req, res) {
        let {
            id
        } = req.params
        let {
            user_id,
            user_name
        } = req.headers;
        await GradingModel.deleteOne({
            _id: id
        });
        saveActivity(user_id, user_name, "Grading", "An Grading About has been deleted.", "Deleted");
        let gradings = await GradingModel.find({})
        res.json({
            status: true,
            result: gradings
        })
    }

    async getScalesBase(req, res) {
        let {
            user_id
        } = req.headers;
        try {
            let gradings = await GradingModel.find({})
            let smsTemps = await SmsTemplateModel.find({})
            let emailTemps = await EmailTemplateModel.find({})
            res.json({
                status: true,
                result: {
                    grading: gradings,
                    sms: smsTemps,
                    email: emailTemps
                }
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async getScalesOfGrading(req, res) {
        let {
            user_id
        } = req.headers;
        let {
            id
        } = req.params;
        try {
            let grading = await GradingModel.find({
                _id: id
            });
            res.json({
                status: true,
                result: grading
            });
        } catch (error) {
            res.json({
                status: false,
                message: 'Cannot proceed your request'
            });
        }
    }

    async updateScalesOfGrading(req, res) {
        let {
            user_id,
            user_name
        } = req.headers;
        let {
            id
        } = req.params;
        let data = {}
        data['scales'] = req.body.scales
        data['updated_at'] = Date.now();
        data['updated_by'] = {
            name: user_name,
            user_id: user_id
        };

        let scales = await GradingModel.updateOne({
            _id: id
        }, data);
        saveActivity(user_id, user_name, "Grading", "A Grading has been updated.", "Updated");
        res.json({
            status: true,
            result: scales
        })
    }


}

module.exports = setupController;