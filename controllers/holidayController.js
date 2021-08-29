const HolidayModel = require("../models/holiday");
const { saveActivity } = require("./activityUtil");
var mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const db = require("../db").queries;

class holidayController {
  async getHolidays(req, res) {
    let { session_id, school_id } = req.params;
    let query = {};
    if (session_id !== undefined) query.session_id = session_id;
    if (school_id !== undefined) query.school_id = school_id;

    let holidays = await HolidayModel.find(query).sort({holiday_date: 1});
    res.json({ status: true, result: holidays });
  }

  async getHolidaysByGrade(req, res) {
    let { academic_year_id, school_id } = req.params;

    let holidays = await HolidayModel.find({academic_year_id: academic_year_id, school_id: school_id});
    res.json({ status: true, result: holidays });
  }

  async addHoliday(req, res) {
    let { user_id, user_name } = req.headers;

    let data = 
      { ... req.body.holiday,
        created_at: Date.now(),
        created_by: {
          name: user_name,
          user_id: user_id
        }
      };

    await HolidayModel.create(data);
    saveActivity(
      user_id,
      user_name,
      "Holiday",
      "New Holiday has been created.",
      "Created"
    );
    res.json({ status: true });
  }

  async getHoliday(req, res) {
    let { id } = req.params;
    let holiday = await HolidayModel.findOne({ _id: id });
    res.json({ status: true, result: holiday });
  }

  async editHoliday(req, res) {
    let { user_id, user_name } = req.headers;
    let data = 
      { ... req.body.holiday,
        updated_at: Date.now(),
        updated_by: {
          name: user_name,
          user_id: user_id
        }
      };

    let id = data.id;
    delete data.id;

    await HolidayModel.updateOne({ _id: id }, { $set: data });
    saveActivity(
      user_id,
      user_name,
      "Holiday",
      "A Holiday has been edited.",
      "Updated"
    );
    res.json({ status: true });
  }

  async deleteHoliday(req, res) {
    let { id } = req.params;
    let { user_id, user_name } = req.headers;
    await HolidayModel.deleteOne({ _id: id });
    saveActivity(
      user_id,
      user_name,
      "Holiday",
      "An Holiday has been deleted.",
      "Deleted"
    );
    res.json({ status: true });
  }
}

module.exports = holidayController;
