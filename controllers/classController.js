const ClassModel = require('../models/class');
const { saveActivity } = require('./activityUtil');

var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const db = require("../db").queries;



class classController {

  async getClassesByGrade(req, res) {

    let { grade } = req.body
    let { school_id } = req.headers

    let unwindUsers = {};
    let lookUp = {};

    let lookUp1 = {};
    let unwindGrades = {};


    let unwindSubjects = {};
    let lookUp2 = {};


    let unwindSessions = {};
    let lookUp3 = {};

    let unwindTeachers = {};
    let lookUp4 = {};
    console.log(ObjectId(grade))
    let match = {
      $match: {
        standard_grade_id: ObjectId(grade),
        school_id: school_id
      }
    }

    lookUp = {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "user_id",
        as: "usersData"
      }
    };

    unwindUsers = {
      $unwind: {
        path: "$usersData",
        preserveNullAndEmptyArrays: true
      }
    };


    lookUp1 = {
      $lookup: {
        from: "schoolgradesmodels",
        localField: "standard_grade_id",
        foreignField: "_id",
        as: "gradeData"
      }
    };

    unwindGrades = {
      $unwind: {
        path: "$gradeData",
        preserveNullAndEmptyArrays: true
      }
    };

    lookUp2 = {
      $lookup: {
        from: "subjectmodels",
        localField: "subject_id",
        foreignField: "_id",
        as: "subjectData"
      }
    };

    unwindSubjects = {
      $unwind: {
        path: "$subjectData",
        preserveNullAndEmptyArrays: true
      }
    };


    lookUp3 = {
      $lookup: {
        from: "sessionmodels",
        localField: "session_id",
        foreignField: "_id",
        as: "sessionData"
      }
    };

    unwindSessions = {
      $unwind: {
        path: "$sessionData",
        preserveNullAndEmptyArrays: true
      }
    };




    let project = {
      "$project": {
        "_id": 1,
        // "id":1,
        "class_days": 1,
        "class_type": 1,
        "created_at": 1,
        "created_by": 1,
        "credit": 1,
        "end_time": 1,
        "location_id": 1,
        "location_room_id": 1,
        "max_student": 1,
        "itemName": 1,
        "cloned_on": 1,
        "cloned": 1,
        "grade_scale_type": 1,
        //   "session_id":1,
        "standard_grade_id": 1,
        "subject_id": 1,
        "start_time": 1,
        "syllabus": 1,


        "teacher.personal_info": 1,
        "teacher._id": 1,
        "teacher.user_id": 1,
        "teacherName": { $concat: ["$teacher.personal_info.first_name", " ", "$teacher.personal_info.last_name"] },
        "grade": 1,
        "subject": 1,
        "session": 1,
        "class_days_name": 1,


        "results_days_names": {
          $reduce: {
            input: "$class_days_name",
            initialValue: "",
            in: { $concat: ["$$value", "\n", "$$this"] }
          }
        }





      }
    }

    let group = {
      $group: {
        _id: "$_id",
        //  id: "$_id",
        class_days: { $first: "$class_days" },
        class_days_name: { $first: "$class_days.itemName" },
        class_type: { $first: "$class_type" },
        credit: { $first: "$credit" },
        end_time: { $first: "$end_time" },

        location_id: { $first: "$location_id" },
        location_room_id: { $first: "$location_room_id" },
        start_time: { $first: "$start_time" },
        max_student: { $first: "$max_student" },
        itemName: { $first: "$name" },
        //  session_id:{$first:"$session_id"},
        standard_grade_id: { $first: "$standard_grade_id" },
        subject_id: { $first: "$subject_id" },
        syllabus: { $first: "$syllabus" },

        created_at: { $first: "$created_at" },
        created_by: { $first: "$created_by" },
        cloned_on: { $first: "$cloned_on" },
        cloned: { $first: "$cloned" },
        grade_scale_type: { $first: "$grade_scale_type" },



        teacher: { $first: "$usersData" },
        grade: { $first: "$gradeData" },
        subject: { $first: "$subjectData" },
        session: { $first: "$sessionData" },



      }
    };

    let query = [
      match,

      lookUp,
      unwindUsers,
      lookUp1,
      unwindGrades,
      lookUp2,
      unwindSubjects,
      lookUp3,
      unwindSessions,

      group,
      project
    ];


    let classes = await db.aggregateData(ClassModel, query)
    // let Lectures = await LectureModel.find({});
    res.json({ status: true, result: classes });



  }
  async getClasses(req, res) {

    let { school_id } = req.headers

    let unwindUsers = {};
    let lookUp = {};

    let lookUp1 = {};
    let unwindGrades = {};


    let unwindSubjects = {};
    let lookUp2 = {};


    let unwindSessions = {};
    let lookUp3 = {};

    let unwindTeachers = {};
    let lookUp4 = {};

    let match = {
      $match: {
        school_id: school_id
      }
    }

    lookUp = {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "user_id",
        as: "usersData"
      }
    };

    unwindUsers = {
      $unwind: {
        path: "$usersData",
        preserveNullAndEmptyArrays: true
      }
    };


    lookUp1 = {
      $lookup: {
        from: "schoolgradesmodels",
        localField: "standard_grade_id",
        foreignField: "_id",
        as: "gradeData"
      }
    };

    unwindGrades = {
      $unwind: {
        path: "$gradeData",
        preserveNullAndEmptyArrays: true
      }
    };

    lookUp2 = {
      $lookup: {
        from: "subjectmodels",
        localField: "subject_id",
        foreignField: "_id",
        as: "subjectData"
      }
    };

    unwindSubjects = {
      $unwind: {
        path: "$subjectData",
        preserveNullAndEmptyArrays: true
      }
    };


    lookUp3 = {
      $lookup: {
        from: "sessionmodels",
        localField: "session_id",
        foreignField: "_id",
        as: "sessionData"
      }
    };

    unwindSessions = {
      $unwind: {
        path: "$sessionData",
        preserveNullAndEmptyArrays: true
      }
    };




    let project = {
      "$project": {
        "_id": 1,
        // "id":1,
        "class_days": 1,
        "class_type": 1,
        "created_at": 1,
        "created_by": 1,
        "credit": 1,
        "end_time": 1,
        "location_id": 1,
        "location_room_id": 1,
        "max_student": 1,
        "itemName": 1,
        "cloned_on": 1,
        "cloned": 1,
        "grade_scale_type": 1,
        //   "session_id":1,
        "standard_grade_id": 1,
        "subject_id": 1,
        "start_time": 1,
        "syllabus": 1,


        "teacher.personal_info": 1,
        "teacher._id": 1,
        "teacher.user_id": 1,
        "teacherName": { $concat: ["$teacher.personal_info.first_name", " ", "$teacher.personal_info.last_name"] },
        "grade": 1,
        "subject": 1,
        "session": 1,
        "class_days_name": 1,


        "results_days_names": {
          $reduce: {
            input: "$class_days_name",
            initialValue: "",
            in: { $concat: ["$$value", "\n", "$$this"] }
          }
        }





      }
    }

    let group = {
      $group: {
        _id: "$_id",
        //  id: "$_id",
        class_days: { $first: "$class_days" },
        class_days_name: { $first: "$class_days.itemName" },
        class_type: { $first: "$class_type" },
        credit: { $first: "$credit" },
        end_time: { $first: "$end_time" },

        location_id: { $first: "$location_id" },
        location_room_id: { $first: "$location_room_id" },
        start_time: { $first: "$start_time" },
        max_student: { $first: "$max_student" },
        itemName: { $first: "$name" },
        //  session_id:{$first:"$session_id"},
        standard_grade_id: { $first: "$standard_grade_id" },
        subject_id: { $first: "$subject_id" },
        syllabus: { $first: "$syllabus" },

        created_at: { $first: "$created_at" },
        created_by: { $first: "$created_by" },
        cloned_on: { $first: "$cloned_on" },
        cloned: { $first: "$cloned" },
        grade_scale_type: { $first: "$grade_scale_type" },



        teacher: { $first: "$usersData" },
        grade: { $first: "$gradeData" },
        subject: { $first: "$subjectData" },
        session: { $first: "$sessionData" },



      }
    };

    let query = [
      match,

      lookUp,
      unwindUsers,
      lookUp1,
      unwindGrades,
      lookUp2,
      unwindSubjects,
      lookUp3,
      unwindSessions,

      group,
      project
    ];


    let classes = await db.aggregateData(ClassModel, query)
    // let Lectures = await LectureModel.find({});
    res.json({ status: true, result: classes });
  }
  async getClonedClasses(req, res) {

    let { user_id } = req.headers

    let unwindUsers = {};
    let lookUp = {};

    let lookUp1 = {};
    let unwindGrades = {};


    let unwindSubjects = {};
    let lookUp2 = {};


    let unwindSessions = {};
    let lookUp3 = {};

    let unwindTeachers = {};
    let lookUp4 = {};

    let match = {
      $match: {
        cloned: 1,
        school_id: school_id
      }
    }

    lookUp = {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "user_id",
        as: "usersData"
      }
    };

    unwindUsers = {
      $unwind: {
        path: "$usersData",
        preserveNullAndEmptyArrays: true
      }
    };


    lookUp1 = {
      $lookup: {
        from: "schoolgradesmodels",
        localField: "standard_grade_id",
        foreignField: "_id",
        as: "gradeData"
      }
    };

    unwindGrades = {
      $unwind: {
        path: "$gradeData",
        preserveNullAndEmptyArrays: true
      }
    };

    lookUp2 = {
      $lookup: {
        from: "subjectmodels",
        localField: "subject_id",
        foreignField: "_id",
        as: "subjectData"
      }
    };

    unwindSubjects = {
      $unwind: {
        path: "$subjectData",
        preserveNullAndEmptyArrays: true
      }
    };


    lookUp3 = {
      $lookup: {
        from: "sessionmodels",
        localField: "session_id",
        foreignField: "_id",
        as: "sessionData"
      }
    };

    unwindSessions = {
      $unwind: {
        path: "$sessionData",
        preserveNullAndEmptyArrays: true
      }
    };




    let project = {
      "$project": {
        "_id": 1,
        // "id":1,
        "class_days": 1,
        "class_type": 1,
        "created_at": 1,
        "created_by": 1,
        "credit": 1,
        "end_time": 1,
        "location_id": 1,
        "location_room_id": 1,
        "max_student": 1,
        "itemName": 1,
        "cloned_on": 1,
        "cloned": 1,
        "grade_scale_type": 1,
        //   "session_id":1,
        "standard_grade_id": 1,
        "subject_id": 1,
        "start_time": 1,
        "syllabus": 1,


        "teacher.personal_info": 1,
        "teacher._id": 1,
        "teacher.user_id": 1,
        "teacherName": { $concat: ["$teacher.personal_info.first_name", " ", "$teacher.personal_info.last_name"] },
        "grade": 1,
        "subject": 1,
        "session": 1,
        "class_days_name": 1,


        "results_days_names": {
          $reduce: {
            input: "$class_days_name",
            initialValue: "",
            in: { $concat: ["$$value", "\n", "$$this"] }
          }
        }





      }
    }

    let group = {
      $group: {
        _id: "$_id",
        //  id: "$_id",
        class_days: { $first: "$class_days" },
        class_days_name: { $first: "$class_days.itemName" },
        class_type: { $first: "$class_type" },
        credit: { $first: "$credit" },
        end_time: { $first: "$end_time" },

        location_id: { $first: "$location_id" },
        location_room_id: { $first: "$location_room_id" },
        start_time: { $first: "$start_time" },
        max_student: { $first: "$max_student" },
        itemName: { $first: "$name" },
        //  session_id:{$first:"$session_id"},
        standard_grade_id: { $first: "$standard_grade_id" },
        subject_id: { $first: "$subject_id" },
        syllabus: { $first: "$syllabus" },

        created_at: { $first: "$created_at" },
        created_by: { $first: "$created_by" },
        cloned_on: { $first: "$cloned_on" },
        cloned: { $first: "$cloned" },
        grade_scale_type: { $first: "$grade_scale_type" },



        teacher: { $first: "$usersData" },
        grade: { $first: "$gradeData" },
        subject: { $first: "$subjectData" },
        session: { $first: "$sessionData" },



      }
    };

    let query = [
      match,

      lookUp,
      unwindUsers,
      lookUp1,
      unwindGrades,
      lookUp2,
      unwindSubjects,
      lookUp3,
      unwindSessions,

      group,
      project
    ];


    let classes = await db.aggregateData(ClassModel, query)
    // let Lectures = await LectureModel.find({});
    res.json({ status: true, result: classes });
  }


  async addClass(req, res) {
    let data = req.body;
    let { user_id, user_name, school_id } = req.headers;

    //   data = ConvertObjectIds(data)
    data['school_id'] = school_id;
    data['created_at'] = Date.now();
    data['created_by'] = {
      name: user_name,
      user_id: user_id
    };

    await ClassModel.create(data);
    saveActivity(user_id, user_name, "Class", "New Class has been created.", "Created");
    res.json({ status: true });
  }

  async cloneClass(req, res) {
    let data = req.body;
    let { user_id, user_name, school_id } = req.headers;
    data['school_id'] = school_id;
    data['created_at'] = Date.now();
    data['created_by'] = {
      name: req.headers.user_name,
      user_id: req.headers.user_id
    };

    var oldData = data.oldData
    var newData = data.newData
    var length = data.oldData.length

    for (var i = 0; i < length; i++) {
      data['name'] = oldData[i].itemName
      data['notes'] = oldData[i].notes
      data['class_days'] = oldData[i].class_days
      data['end_time'] = oldData[i].end_time
      data['start_time'] = oldData[i].start_time
      data['syllabus'] = oldData[i].syllabus
      data['class_type'] = oldData[i].class_type
      data['max_student'] = oldData[i].max_student
      data['session_id'] = newData.session == 'Select Session' ? oldData[i].session._id : newData.session
      data['standard_grade_id'] = oldData[i].grade._id
      data['subject_id'] = oldData[i].subject._id
      data['user_id'] = oldData[i].teacher.user_id
      data.isCloned = 1
      data.cloned = 1
      data.cloned_on = Date.now()

      await ClassModel.updateOne({ _id: oldData[i]._id }, {

        $set: {
          isCloned: 1,
          cloned_on: Date.now(),
          updated_at: Date.now(),
          updated_by: {
            name: user_name,
            user_id: user_id
          }
        }
      });

      await ClassModel.create(data);
    }
    //  await AssignMentModel.create(data);
    saveActivity(user_id, user_name, "Class", "New Class has been created.", "Created");
    res.json({ status: true });
  }


  async getClass(req, res) {
    let { user_id, user_name } = req.headers;
    let { id } = req.params;
    let classObj = await ClassModel.findOne({ _id: id });
    res.json({ status: true, result: classObj });
  }


  async editClass(req, res) {
    let id = req.body.id;
    let data = req.body;
    delete data['id']



    let { user_id, user_name } = req.headers;
    await ClassModel.updateOne(
      { _id: id },
      {
        ...data
      });
    saveActivity(user_id, user_name, "Class", "A Class has been edited.", "Updated");
    res.json({ status: true });
  }
  async deleteClass(req, res) {
    let { id } = req.params;
    let { user_id, user_name } = req.headers;
    await ClassModel.deleteOne({ _id: id });
    saveActivity(user_id, user_name, "Class", "An Class has been deleted.", "Deleted");
    res.json({ status: true });
  }

}

module.exports = classController;