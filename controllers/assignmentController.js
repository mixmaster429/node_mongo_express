const AssignMentModel = require('../models/assignment');
const { saveActivity } = require('./activityUtil');
const db = require("../db").queries;


class assignmentController {
    async getAssignments(req, res) {
      let { school_id } = req.headers;
     // let match = {};

      let match = {
        $match: { school_id: school_id }
      }


      // match = {
      //   $match: {
      //     isCloned: 0
      
         
      //   }
      // }

        let lookUp = {};
        let unwindSessions = {};

        let lookUp1 = {};
        let unwindGrades = {};


        let unwindSubjects = {};
        let lookUp2 = {};


        let lookUp3 = {};
        let unwindHomeWorkGrade = {};

        let lookUp4 = {};
        let unwindTeacherData = {};


        let addFields =  { "$addFields": { "sessionObjectId": { "$toObjectId": "$session_id" }}}
        lookUp = {
            
            $lookup: {
              from: "sessionmodels",
              localField: "sessionObjectId",
              foreignField: "_id",
              as: "sessionData"
            }
          };

        

          unwindSessions= {
            $unwind: {
              path: "$sessionData",
              preserveNullAndEmptyArrays: true
            }
          };

          let addFields1 =  { "$addFields": { "gradeObjectId": { "$toObjectId": "$standard_grade_id" }}}

          lookUp1 = {
            $lookup: {
              from: "schoolgradesmodels",
              localField: "gradeObjectId",
              foreignField: "_id",
              as: "gradesData"
            }
          };

          unwindGrades= {
            $unwind: {
              path: "$gradesData",
              preserveNullAndEmptyArrays: true
            }
          };


          let addFields2 =  { "$addFields": { "subjectObjectId": { "$toObjectId": "$subject_id" }}}

          lookUp2 = {
            $lookup: {
              from: "subjectmodels",
              localField: "subjectObjectId",
              foreignField: "_id",
              as: "subjectData"
            }
          };

          unwindSubjects= {
            $unwind: {
              path: "$subjectData",
              preserveNullAndEmptyArrays: true
            }
          };


          let addFields3 =  { "$addFields": { "homeworkGradeObjectId": { "$toObjectId": "$homework_grade_id" }}}

          lookUp3 = {
            $lookup: {
              from: "homeworkgrades",
              localField: "homeworkGradeObjectId",
              foreignField: "_id",
              as: "homeWorkGradesData"
            }
          };

          unwindHomeWorkGrade= {
            $unwind: {
              path: "$homeWorkGradesData",
              preserveNullAndEmptyArrays: true
            }
          };


          let addFields4 =  { "$addFields": { "teacherObjectId": { "$toObjectId": "$teacher_id" }}}

          lookUp4 = {
            $lookup: {
              from: "users",
              localField: "teacherObjectId",
              foreignField: "_id",
              as: "teacherData"
            }
          };

          unwindTeacherData= {
            $unwind: {
              path: "$teacherData",
              preserveNullAndEmptyArrays: true
            }
          };

          let project = {
            "$project": {
               "_id":1,
               "title":1,
               "description":1,
               "visible_date":1,
               "due_date":1,
              "class_room_ids":1,
              //  "session_id":1,
           
                "end_time":1,
                "grade_scale_type":1,
              
            
               // "standard_grade_id":1,
              
                "start_time":1,
               // "subject_id":1,
                "user_id":1,
                "created_at":1,

              "session._id": 1,
           //   "session.id": 1,
              "session.name": 1,

              "grade.name": 1,
              "grade._id": 1,
            //  "grade.id": 1,


          //    "subject.id": 1,
              "subject.name": 1,
              "subject._id": 1,
              "class_type":1,
              "files":1,
              "materialLink":1,
              "bookLink":1,

             
              "homework_grade.name": 1,
              "homework_grade._id": 1,

              "teacher.personal_info":1,
              "teacher._id":1,
              "teacher.user_id":1,
              "teacherName":{ $concat: [ "$teacher.personal_info.first_name", " ", "$teacher.personal_info.last_name" ] },
              "cloned_on":1,
              "isCloned":
               {
                 $cond: { if: { $eq:  [ "$isCloned", 0 ] } , then: "No", else: "Yes" }
               }
              
             
               
          
            }
          }

          let group = {
            $group: {
              _id: "$_id",
              title:{$first:"$title"},
              description:{$first:"$description"},
              visible_date:{$first:"$visible_date"},
              due_date:{$first:"$due_date"},
             // endTime: {$first:"$endTime"},
              end_time: {$first:"$end_time"},
              grade_scale_type:{$first:"$grade_scale_type"},
              lecture_date: {$first:"$lecture_date"},
              notes: {$first:"$notes"},
             
             // startTime: {$first:"$startTime"},
              start_time: {$first:"$start_time"},
            //  subject_id: {$first:"$subject_id"},
              user_id: {$first:"$user_id"},
              created_at: {$first:"$created_at"},
            //  session_id: {$first:"$session_id"},
              
              class_room_ids: { $first: "$class_room_ids"},
              class_type: { $first: "$class_room_ids.class_type"},
              materialLink: { $first: "$materialLink"},
              bookLink: { $first: "$bookLink"},
              files: { $first: "$files"},
              session: {$first: "$sessionData"},
              grade: {$first: "$gradesData"},
              subject: {$first: "$subjectData"},
              homework_grade: {$first: "$homeWorkGradesData"},
              teacher: {$first: "$teacherData"},
              isCloned:{$first: "$isCloned"},
              cloned_on:{$first: "$cloned_on"},

           
             
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

            addFields3,
            lookUp3,
            unwindHomeWorkGrade,

            addFields4,
            lookUp4,
            unwindTeacherData,
            group,
            project
          ];



        let assignments = await db.aggregateData(AssignMentModel,query);
        res.json({ status: true, result: assignments });
    }
    async getAssignmentsByGrade(req, res) {
      let { school_id } = req.headers;
     // let match = {};

      let match = {
        $match: {
          standard_grade_id:req.body.grade,
          school_id: school_id
        }
      }


      // match = {
      //   $match: {
      //     isCloned: 0
      
         
      //   }
      // }

        let lookUp = {};
        let unwindSessions = {};

        let lookUp1 = {};
        let unwindGrades = {};


        let unwindSubjects = {};
        let lookUp2 = {};


        let lookUp3 = {};
        let unwindHomeWorkGrade = {};

        let lookUp4 = {};
        let unwindTeacherData = {};


        let addFields =  { "$addFields": { "sessionObjectId": { "$toObjectId": "$session_id" }}}
        lookUp = {
            
            $lookup: {
              from: "sessionmodels",
              localField: "sessionObjectId",
              foreignField: "_id",
              as: "sessionData"
            }
          };

        

          unwindSessions= {
            $unwind: {
              path: "$sessionData",
              preserveNullAndEmptyArrays: true
            }
          };

          let addFields1 =  { "$addFields": { "gradeObjectId": { "$toObjectId": "$standard_grade_id" }}}

          lookUp1 = {
            $lookup: {
              from: "schoolgradesmodels",
              localField: "gradeObjectId",
              foreignField: "_id",
              as: "gradesData"
            }
          };

          unwindGrades= {
            $unwind: {
              path: "$gradesData",
              preserveNullAndEmptyArrays: true
            }
          };


          let addFields2 =  { "$addFields": { "subjectObjectId": { "$toObjectId": "$subject_id" }}}

          lookUp2 = {
            $lookup: {
              from: "subjectmodels",
              localField: "subjectObjectId",
              foreignField: "_id",
              as: "subjectData"
            }
          };

          unwindSubjects= {
            $unwind: {
              path: "$subjectData",
              preserveNullAndEmptyArrays: true
            }
          };


          let addFields3 =  { "$addFields": { "homeworkGradeObjectId": { "$toObjectId": "$homework_grade_id" }}}

          lookUp3 = {
            $lookup: {
              from: "homeworkgrades",
              localField: "homeworkGradeObjectId",
              foreignField: "_id",
              as: "homeWorkGradesData"
            }
          };

          unwindHomeWorkGrade= {
            $unwind: {
              path: "$homeWorkGradesData",
              preserveNullAndEmptyArrays: true
            }
          };


          let addFields4 =  { "$addFields": { "teacherObjectId": { "$toObjectId": "$teacher_id" }}}

          lookUp4 = {
            $lookup: {
              from: "users",
              localField: "teacherObjectId",
              foreignField: "_id",
              as: "teacherData"
            }
          };

          unwindTeacherData= {
            $unwind: {
              path: "$teacherData",
              preserveNullAndEmptyArrays: true
            }
          };

          let project = {
            "$project": {
               "_id":1,
               "title":1,
               "description":1,
               "visible_date":1,
               "due_date":1,
              "class_room_ids":1,
              //  "session_id":1,
           
                "end_time":1,
                "grade_scale_type":1,
              
            
               // "standard_grade_id":1,
              
                "start_time":1,
               // "subject_id":1,
                "user_id":1,
                "created_at":1,

              "session._id": 1,
           //   "session.id": 1,
              "session.name": 1,

              "grade.name": 1,
              "grade._id": 1,
            //  "grade.id": 1,


          //    "subject.id": 1,
              "subject.name": 1,
              "subject._id": 1,
              "class_type":1,
              "files":1,
              "materialLink":1,
              "bookLink":1,

             
              "homework_grade.name": 1,
              "homework_grade._id": 1,

              "teacher.personal_info":1,
              "teacher._id":1,
              "teacher.user_id":1,
              "teacherName":{ $concat: [ "$teacher.personal_info.first_name", " ", "$teacher.personal_info.last_name" ] },
              "cloned_on":1,
              "isCloned":
               {
                 $cond: { if: { $eq:  [ "$isCloned", 0 ] } , then: "No", else: "Yes" }
               }
              
             
               
          
            }
          }

          let group = {
            $group: {
              _id: "$_id",
              title:{$first:"$title"},
              description:{$first:"$description"},
              visible_date:{$first:"$visible_date"},
              due_date:{$first:"$due_date"},
             // endTime: {$first:"$endTime"},
              end_time: {$first:"$end_time"},
              grade_scale_type:{$first:"$grade_scale_type"},
              lecture_date: {$first:"$lecture_date"},
              notes: {$first:"$notes"},
             
             // startTime: {$first:"$startTime"},
              start_time: {$first:"$start_time"},
            //  subject_id: {$first:"$subject_id"},
              user_id: {$first:"$user_id"},
              created_at: {$first:"$created_at"},
            //  session_id: {$first:"$session_id"},
              
              class_room_ids: { $first: "$class_room_ids"},
              class_type: { $first: "$class_room_ids.class_type"},
              materialLink: { $first: "$materialLink"},
              bookLink: { $first: "$bookLink"},
              files: { $first: "$files"},
              session: {$first: "$sessionData"},
              grade: {$first: "$gradesData"},
              subject: {$first: "$subjectData"},
              homework_grade: {$first: "$homeWorkGradesData"},
              teacher: {$first: "$teacherData"},
              isCloned:{$first: "$isCloned"},
              cloned_on:{$first: "$cloned_on"},

           
             
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

            addFields3,
            lookUp3,
            unwindHomeWorkGrade,

            addFields4,
            lookUp4,
            unwindTeacherData,
            group,
            project
          ];



        let assignments = await db.aggregateData(AssignMentModel,query);
        res.json({ status: true, result: assignments });
    }

    async getClonedAssignments(req, res) {
      let { school_id } = req.headers;

    //  let match = {};

      let match = {
        $match: {
          cloned:1,
          school_id: school_id
        }
      }

      // match = {
      //   $match: {
      //     cloned: 1
      
         
      //   }
      // }

        let lookUp = {};
        let unwindSessions = {};

        let lookUp1 = {};
        let unwindGrades = {};


        let unwindSubjects = {};
        let lookUp2 = {};


        let lookUp3 = {};
        let unwindHomeWorkGrade = {};

        let lookUp4 = {};
        let unwindTeacherData = {};


        let addFields =  { "$addFields": { "sessionObjectId": { "$toObjectId": "$session_id" }}}
        lookUp = {
            
            $lookup: {
              from: "sessionmodels",
              localField: "sessionObjectId",
              foreignField: "_id",
              as: "sessionData"
            }
          };

        

          unwindSessions= {
            $unwind: {
              path: "$sessionData",
              preserveNullAndEmptyArrays: true
            }
          };

          let addFields1 =  { "$addFields": { "gradeObjectId": { "$toObjectId": "$standard_grade_id" }}}

          lookUp1 = {
            $lookup: {
              from: "schoolgradesmodels",
              localField: "gradeObjectId",
              foreignField: "_id",
              as: "gradesData"
            }
          };

          unwindGrades= {
            $unwind: {
              path: "$gradesData",
              preserveNullAndEmptyArrays: true
            }
          };


          let addFields2 =  { "$addFields": { "subjectObjectId": { "$toObjectId": "$subject_id" }}}

          lookUp2 = {
            $lookup: {
              from: "subjectmodels",
              localField: "subjectObjectId",
              foreignField: "_id",
              as: "subjectData"
            }
          };

          unwindSubjects= {
            $unwind: {
              path: "$subjectData",
              preserveNullAndEmptyArrays: true
            }
          };


          let addFields3 =  { "$addFields": { "homeworkGradeObjectId": { "$toObjectId": "$homework_grade_id" }}}

          lookUp3 = {
            $lookup: {
              from: "homeworkgrades",
              localField: "homeworkGradeObjectId",
              foreignField: "_id",
              as: "homeWorkGradesData"
            }
          };

          unwindHomeWorkGrade= {
            $unwind: {
              path: "$homeWorkGradesData",
              preserveNullAndEmptyArrays: true
            }
          };


          let addFields4 =  { "$addFields": { "teacherObjectId": { "$toObjectId": "$teacher_id" }}}

          lookUp4 = {
            $lookup: {
              from: "users",
              localField: "teacherObjectId",
              foreignField: "_id",
              as: "teacherData"
            }
          };

          unwindTeacherData= {
            $unwind: {
              path: "$teacherData",
              preserveNullAndEmptyArrays: true
            }
          };

          let project = {
            "$project": {
               "_id":1,
               "title":1,
               "description":1,
               "visible_date":1,
               "due_date":1,
              "class_room_ids":1,
              //  "session_id":1,
           
                "end_time":1,
                "grade_scale_type":1,
              
            
               // "standard_grade_id":1,
              
                "start_time":1,
               // "subject_id":1,
                "user_id":1,
                "created_at":1,

              "session._id": 1,
           //   "session.id": 1,
              "session.name": 1,

              "grade.name": 1,
              "grade._id": 1,
            //  "grade.id": 1,


          //    "subject.id": 1,
              "subject.name": 1,
              "subject._id": 1,
              "class_type":1,

             
              "homework_grade.name": 1,
              "homework_grade._id": 1,

              "teacher.personal_info":1,
              "teacher._id":1,
              "teacher.user_id":1,
              "teacherName":{ $concat: [ "$teacher.personal_info.first_name", " ", "$teacher.personal_info.last_name" ] },
              "cloned_on":1,
              "isCloned":
               {
                 $cond: { if: { $eq:  [ "$isCloned", 0 ] } , then: "No", else: "Yes" }
               }
              
             
               
          
            }
          }

          let group = {
            $group: {
              _id: "$_id",
              title:{$first:"$title"},
              description:{$first:"$description"},
              visible_date:{$first:"$visible_date"},
              due_date:{$first:"$due_date"},
             // endTime: {$first:"$endTime"},
              end_time: {$first:"$end_time"},
              grade_scale_type:{$first:"$grade_scale_type"},
              lecture_date: {$first:"$lecture_date"},
              notes: {$first:"$notes"},
             
             // startTime: {$first:"$startTime"},
              start_time: {$first:"$start_time"},
            //  subject_id: {$first:"$subject_id"},
              user_id: {$first:"$user_id"},
              created_at: {$first:"$created_at"},
            //  session_id: {$first:"$session_id"},
              
              class_room_ids: { $first: "$class_room_ids"},
              class_type: { $first: "$class_room_ids.class_type"},
              session: {$first: "$sessionData"},
              grade: {$first: "$gradesData"},
              subject: {$first: "$subjectData"},
              homework_grade: {$first: "$homeWorkGradesData"},
              teacher: {$first: "$teacherData"},
              isCloned:{$first: "$isCloned"},
              cloned_on:{$first: "$cloned_on"},

           
             
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

            addFields3,
            lookUp3,
            unwindHomeWorkGrade,

            addFields4,
            lookUp4,
            unwindTeacherData,
            group,
            project
          ];



        let assignments = await db.aggregateData(AssignMentModel,query);
        res.json({ status: true, result: assignments });
    }

    async addAssignment(req, res) {
        let data = req.body;
        data['created_at'] = Date.now();
        data['created_by'] =  {
                name: req.headers.user_name,
                user_id: req.headers.user_id
            };
         
        let { user_id, user_name } = req.headers;
        data['user_id'] = user_id
      //  data['user_name'] = user_name

      var class_room_ids = data.class_room_ids
      var length = data.class_room_ids.length
      for(var i= 0 ; i<length;i++){
          data['class_room_ids'] = class_room_ids[i]
          data['standard_grade_id'] = class_room_ids[i].grade._id
       //   data['session_id'] = class_room_ids[i].session._id
          data['subject_id'] = class_room_ids[i].subject._id
          data['teacher_id'] = class_room_ids[i].teacher._id
          
      await AssignMentModel.create(data);
      }
      //  await AssignMentModel.create(data);
        saveActivity(user_id, user_name, "Assignment", "New Assignment has been created.", "Created");
        res.json({ status: true });
    }
    async cloneAssignment(req,res){
      let data = req.body;
      data['created_at'] = Date.now();
      data['created_by'] =  {
              name: req.headers.user_name,
              user_id: req.headers.user_id
          };
       
      let { user_id, user_name } = req.headers;
   
    //  data['user_name'] = user_name

    var oldData = data.oldData
    var newData = data.newData

   
    var length = data.oldData.length
   
    for(var i= 0 ; i<length;i++){
        data['title'] = oldData[i].title
        data['description'] = oldData[i].description
        data['class_room_ids'] = newData.class_room.length>0 ? newData.class_room[0] : oldData[i].class_room_ids
        data['end_time'] = newData.dueDateTime
        data['due_date'] = newData.due_date
        data['visible_date'] = newData.visible_date

        data['session_id'] = newData.session=='Select Session' ? oldData[i].session._id : newData.session
        data['standard_grade_id'] = oldData[i].grade._id
        data['subject_id'] =  oldData[i].subject._id
        data['teacher_id'] =  oldData[i].teacher._id
        data['homework_grade_id'] =  oldData[i].homework_grade._id
        data['grade_scale_type'] =  oldData[i].grade_scale_type
        data['user_id'] = user_id


        data.isCloned = 1
        data.cloned = 1
        data.cloned_on = Date.now()

        await AssignMentModel.updateOne({ _id: oldData[i]._id }, {
                
          $set:{
          isCloned:1,
          cloned_on:Date.now(),
          updated_at: Date.now(),
          updated_by: {
              name: user_name,
              user_id: user_id
          }
      }
           });
        
    await AssignMentModel.create(data);
    }
    //  await AssignMentModel.create(data);
      saveActivity(user_id, user_name, "Assignment", "New Assignment has been created.", "Created");
      res.json({ status: true });
    }
    async getAssignment(req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let assingmentObj = await AssignMentModel.findOne({ _id: id });
        res.json({ status: true, result: assingmentObj });
    }
    async editAssignment(req, res) {
        let id = req.body.id;
        let data = req.body;
        delete data['id']
        let { user_id, user_name } = req.headers;
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: req.headers.user_name,
                user_id: req.headers.user_id
            };
        
        
       
        await AssignMentModel.updateOne(
            { _id: id },{$set:data});
        saveActivity(user_id, user_name, "Assignment", "A Assignment has been edited.", "Updated");
        res.json({ status: true });
    }
    async deleteAssignment(req, res) {
        let { id } = req.params;
        let { user_id, user_name } = req.headers;
        await AssignMentModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Assignment", "An Assignment has been deleted.", "Deleted");
        res.json({ status: true });
    }
}

module.exports = assignmentController;