const User = require('../models/users');
const RelationModel = require('../models/relation');
const {
  saveActivity
} = require('./activityUtil');
const StudentModel = require('../models/student');
const db = require("../db").queries;
const crypto = require('crypto');

class studentController {
  async getRelations(req, res) {
    let { school_id } = req.headers;
    let relations = await RelationModel.find({ school_id: school_id });
    res.json({
      status: true,
      result: relations,
    });
  }

  async addRelation(req, res) {
    let { name, notes } = req.body;
    let { user_id, user_name, school_id } = req.headers;
    await RelationModel.create({
      // id: crypto.randomBytes(16).toString("hex"),
      school_id: school_id,
      name: name,
      notes: notes,
      created_at: Date.now(),
      created_by: {
        user_id: user_id,
        user_name: user_name,
      },
    });
    saveActivity(
      user_id,
      user_name,
      'Student',
      'New Student Relation has been created.',
      'Created'
    );
    res.json({
      status: true,
    });
  }

  async editRelation(req, res) {
    let { id, name, notes } = req.body;
    let { user_id, user_name, school_id } = req.headers;
    await RelationModel.updateOne(
      {
        _id: id,
      },
      {
        school_id: school_id,
        name: name,
        notes: notes,
        updated_at: Date.now(),
        updated_by: {
          user_id: user_id,
          user_name: user_name,
        },
      }
    );
    saveActivity(user_id, user_name, 'Student', 'A Student Relation has been created.', 'Updated');
    res.json({
      status: true,
    });
  }

  async deleteAdmission(req, res) {
    let { id } = req.params;
    let { user_id, user_name } = req.headers;
    await StudentModel.deleteOne({
      _id: id,
    });
    saveActivity(user_id, user_name, 'Student', 'An Admission has been deleted.', 'Deleted');
    res.json({
      status: true,
    });
  }

  async deleteRelation(req, res) {
    let { id } = req.params;
    let { user_id, user_name } = req.headers;
    await RelationModel.deleteOne({
      _id: id,
    });
    saveActivity(user_id, user_name, 'Student', 'A Student Relation has been deleted.', 'Deleted');
    res.json({
      status: true,
    });
  }

  async getAdmission(req, res) {
    let { user_id } = req.headers;
    let { id } = req.params;
    try {
      let result = await StudentModel.find({
        _id: id,
      });
      res.json({
        status: true,
        result: result,
      });
    } catch (error) {
      res.json({
        status: false,
        message: 'Cannot proceed your request',
      });
    }
  }

  async getAdmissions(req, res) {
    let { school_id } = req.headers;
    let lookUp = {};
    let unwindSessions = {};

    let lookUp1 = {};
    let unwindGrades = {};

    let lookUp2 = {};
    let unwindSchools = {};

    let match = {};
    let confirm = req.params.is_confirm == 'true' ? '1' : '0';

    match = {
      $match: {
        is_confirm: confirm,
        school_id: school_id,
      },
    };

    let addFields = {
      $addFields: {
        sessionObjectId: {
          $toObjectId: '$session_id',
        },
      },
    };
    lookUp = {
      $lookup: {
        from: 'sessionmodels',
        localField: 'sessionObjectId',
        foreignField: '_id',
        as: 'sessionData',
      },
    };

    unwindSessions = {
      $unwind: {
        path: '$sessionData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let addFields1 = {
      $addFields: {
        gradeObjectId: {
          $toObjectId: '$standard_grade_id',
        },
      },
    };

    lookUp1 = {
      $lookup: {
        from: 'schoolgradesmodels',
        localField: 'gradeObjectId',
        foreignField: '_id',
        as: 'gradesData',
      },
    };

    unwindGrades = {
      $unwind: {
        path: '$gradesData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let addFields2 = {
      $addFields: {
        schoolObjectId: {
          $toObjectId: '$school_id',
        },
      },
    };

    lookUp2 = {
      $lookup: {
        from: 'users',
        localField: 'schoolObjectId',
        foreignField: '_id',
        as: 'schoolData',
      },
    };

    unwindSchools = {
      $unwind: {
        path: '$schoolData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let project = {
      $project: {
        _id: 1,
        image: 1,
        inquiry_status_id: 1,
        source_id: 1,
        source: 1,
        source_details: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        gender_id: 1,
        medical: 1,
        address: 1,
        is_confirm: 1,
        inquiry_date: 1,
        birth_date: 1,
        email: 1,
        phone: 1,
        parent_name: 1,
        parent_phone: 1,
        parent_address: 1,
        parent_email: 1,
        created_at: 1,
        created_by: 1,

        'session._id': 1,
        'session.id': 1,
        'session.name': 1,

        'grade.name': 1,
        'grade._id': 1,
        'grade.id': 1,
        schoolName: 1,
      },
    };

    let group = {
      $group: {
        _id: '$_id',
        image: {
          $first: '$image',
        },
        inquiry_date: {
          $first: '$inquiry_date',
        },
        inquiry_status_id: {
          $first: '$inquiry_status_id',
        },
        // source:{$first:"$source"},
        source_details: {
          $first: '$source_details',
        },
        source: {
          $first: '$source',
        },
        first_name: {
          $first: '$first_name',
        },
        last_name: {
          $first: '$last_name',
        },
        middle_name: {
          $first: '$middle_name',
        },
        // endTime: {$first:"$endTime"},
        gender_id: {
          $first: '$gender_id',
        },
        medical: {
          $first: '$medical',
        },
        address: {
          $first: '$address',
        },
        birth_date: {
          $first: '$birth_date',
        },
        email: {
          $first: '$email',
        },
        phone: {
          $first: '$phone',
        },
        parent_name: {
          $first: '$parent_name',
        },
        parent_phone: {
          $first: '$parent_phone',
        },
        parent_address: {
          $first: '$parent_address',
        },
        parent_email: {
          $first: '$parent_email',
        },
        created_at: {
          $first: '$created_at',
        },
        created_by: {
          $first: '$created_by',
        },
        // is_confirm: {$first:"$is_confirm"},

        session: {
          $first: '$sessionData',
        },
        grade: {
          $first: '$gradesData',
        },
        schoolName: {
          $first: '$schoolData.personal_info.first_name',
        },
      },
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
      unwindSchools,

      group,
      project,
    ];

    let Admissions = await db.aggregateData(StudentModel, query);
    res.json({
      status: true,
      result: Admissions,
    });
  }

  async addAddmission(req, res) {
    let data = req.body;
    let { user_id, user_name, school_id } = req.headers;
    let existing = await User.findOne({
      email: data.email,
    });
    if (existing) {
      res.json({
        status: false,
        message: 'This user already exists. Pleast try with another email address.',
      });
      return;
    }
    data.created_at = Date.now();
    data.created_by = {
      user_id: user_id,
      user_name: user_name,
    };
    data.school_id = school_id;
    await StudentModel.create(data);
    saveActivity(
      user_id,
      user_name,
      'Admission',
      'New Admission About has been created.',
      'Created'
    );
    res.json({
      status: true,
    });
  }

  async updateAdmission(req, res) {
    let data = req.body;
    let id = data._id;
    delete data['_id'];
    let { user_id, user_name, school_id } = req.headers;
    (data.updated_at = Date.now()),
      (data.updated_by = {
        user_id: user_id,
        user_name: user_name,
      });
    data.school_id = school_id;
    //  await StudentModel.create(data);

    await StudentModel.updateOne(
      {
        _id: id,
      },
      {
        $set: data,
      }
    );
    saveActivity(
      user_id,
      user_name,
      'Admission',
      'New Admission About has been created.',
      'Created'
    );
    res.json({
      status: true,
    });
  }
  async confirmAdmission(req, res) {
    let { id } = req.body;
    let confirm = req.body.is_confirm == 'true' ? '1' : '0';
    let { user_id, user_name } = req.headers;

    await StudentModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          is_confirm: confirm,
          updated_at: Date.now(),
          updated_by: {
            user_id: user_id,
            user_name: user_name,
          },
        },
      }
    );
    saveActivity(user_id, user_name, 'Admission', 'An Admission has been confirmed.', 'Confirmed');
    res.json({
      status: true,
    });
  }

  async deleteAdmission(req, res) {
    let { id } = req.params;
    let { user_id, user_name } = req.headers;
    await StudentModel.deleteOne({
      _id: id,
    });
    saveActivity(user_id, user_name, 'Student', 'An Student has been deleted.', 'Deleted');
    res.json({
      status: true,
    });
  }

  async editAppointmentAbout(req, res) {
    let { id, name } = req.body;
    let { user_id, user_name } = req.headers;
    await AppointmentAboutModel.updateOne(
      {
        _id: id,
      },
      {
        name: name,
        updated_at: Date.now(),
        updated_by: {
          user_id: user_id,
          user_name: user_name,
        },
      }
    );
    saveActivity(
      user_id,
      user_name,
      'Appointment',
      'An Appointment About has been updated.',
      'Updated'
    );
    res.json({
      status: true,
    });
  }

  async deleteAppointmentAbout(req, res) {
    let { id } = req.params;
    let { user_id, user_name } = req.headers;
    await AppointmentAboutModel.deleteOne({
      _id: id,
    });
    saveActivity(
      user_id,
      user_name,
      'Appointment',
      'An Appointment About has been deleted.',
      'Deleted'
    );
    res.json({
      status: true,
    });
  }
  
}

module.exports = studentController;