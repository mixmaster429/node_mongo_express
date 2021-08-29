const LectureModel = require('../models/lecture');
const { saveActivity } = require('./activityUtil');
const crypto = require('crypto');
const db = require("../db").queries;

class lectureController {

  async getLectures(req, res) {
    let {
      school_id
    } = req.headers
    let match = {
      $match: {
        school_id: school_id
      }
    }

    let lookUp = {};
    let unwindSessions = {};

    let lookUp1 = {};
    let unwindGrades = {};


    let unwindSubjects = {};
    let lookUp2 = {};

    let unwindUsers = {};
    let lookUp3 = {};


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



    unwindSessions = {
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
        "subjectObjectId": {
          "$toObjectId": "$subject_id"
        }
      }
    }

    lookUp2 = {
      $lookup: {
        from: "subjectmodels",
        localField: "subjectObjectId",
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

    let project = {
      "$project": {
        "_id": 1,
        "class_room_ids": 1,
        //  "session_id":1,
        "endTime": 1,
        "end_time": 1,
        "lecture_date": 1,
        "notes": 1,
        //   "standard_grade_id":1,
        "startTime": 1,
        "start_time": 1,
        //  "subject_id":1,
        "user_id": 1,
        "created_at": 1,

        "session._id": 1,
        "session.id": 1,
        "session.name": 1,

        "grade.name": 1,
        "grade._id": 1,
        "grade.id": 1,


        "subject.id": 1,
        "subject.name": 1,
        "subject._id": 1,
        "class_type": 1,

        "teacher.personal_info": 1,
        "teacher._id": 1,
        "teacher.user_id": 1,
        "teacherName": {
          $concat: ["$teacher.personal_info.first_name", " ", "$teacher.personal_info.last_name"]
        }




      }
    }

    let group = {
      $group: {
        _id: "$_id",
        endTime: {
          $first: "$endTime"
        },
        end_time: {
          $first: "$end_time"
        },
        lecture_date: {
          $first: "$lecture_date"
        },
        notes: {
          $first: "$notes"
        },

        startTime: {
          $first: "$startTime"
        },
        start_time: {
          $first: "$start_time"
        },
        //  subject_id: {$first:"$subject_id"},
        user_id: {
          $first: "$user_id"
        },
        created_at: {
          $first: "$created_at"
        },
        //  session_id: {$first:"$session_id"},

        class_room_ids: {
          $first: "$class_room_ids"
        },
        class_type: {
          $first: "$class_room_ids.class_type"
        },
        session: {
          $first: "$sessionData"
        },
        grade: {
          $first: "$gradesData"
        },
        subject: {
          $first: "$subjectData"
        },
        teacher: {
          $first: "$usersData"
        },


      }
    };

    let query = [
      match,
      addFields,
      lookUp,
      unwindSessions,
      addFields1,
      lookUp1,
      unwindGrades,
      addFields2,
      lookUp2,
      unwindSubjects,
      lookUp3,
      unwindUsers,
      group,
      project
    ];


    let Lectures = await db.aggregateData(LectureModel, query)
    // let Lectures = await LectureModel.find({});
    res.json({
      status: true,
      result: Lectures
    });
  }


  async addLecture(req, res) {
    let data = req.body;
    let {
      user_id,
      user_name,
      school_id
    } = req.headers;
    data['school_id'] = school_id
    data['created_at'] = Date.now()
    data['created_by'] = {
      name: user_name,
      user_id: user_id
    }
    var class_room_ids = data.class_room_ids
    var length = data.class_room_ids.length
    for (var i = 0; i < length; i++) {
      data['class_room_ids'] = class_room_ids[i]
      data['standard_grade_id'] = class_room_ids[i].grade._id
      data['session_id'] = class_room_ids[i].session._id
      data['subject_id'] = class_room_ids[i].subject._id
      data['user_id'] = class_room_ids[i].teacher.user_id

      await LectureModel.create(data);
    }
    saveActivity(user_id, user_name, "Lecture", "New Lecture has been created.", "Created");
    res.json({
      status: true
    });
  }


  async getLecture(req, res) {
    let {
      user_id,
      user_name
    } = req.headers;
    let {
      id
    } = req.params;
    let location = await LectureModel.findOne({
      _id: id
    });
    res.json({
      status: true,
      result: location
    });
  }

  async editLecture(req, res) {
    let id = req.body.id;
    let data = req.body;
    delete data['id']
    let {
      user_id,
      user_name
    } = req.headers;
    await LectureModel.updateOne({
      _id: id
    }, data);
    saveActivity(user_id, user_name, "Lecture", "A Lecture has been edited.", "Updated");
    res.json({
      status: true
    });

  }

  async deleteLecture(req, res) {
    let {
      id
    } = req.params;
    let {
      user_id,
      user_name
    } = req.headers;
    await LectureModel.deleteOne({
      _id: id
    });
    saveActivity(user_id, user_name, "Lecture", "A Leacture has been deleted.", "Deleted");
    res.json({
      status: true
    });
  }

}

module.exports = lectureController;