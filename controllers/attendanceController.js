var Users = require('../models/users');
var AttendanceModel = require('../models/attendance');
const downloadResource = require('./downloadUtil');
const { saveActivity } = require('./activityUtil');


class attendanceController {
    async getAttendances (req, res) {
        try {
            let { school_id } = req.headers
            let attendances = await AttendanceModel.find({ school_id: school_id })

            res.json({status: true, result: {
                attendances: attendances,
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async getPunches (req, res) {
        try {
            let id = req.params.id;
            let attendances = await AttendanceModel.find({'created_by.user_id': id})

            res.json({status: true, result: {
                attendances: attendances,
            }})
        } catch (e) {
            res.json({status: false, error: "Getting error"})
        }
    }

    async createPunch (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let find = await AttendanceModel.findOne({school_id: school_id, 'punch_date': (new Date).toLocaleDateString()})
        let data = {}
        if(find) {
            data = find
        } else {
            data['punch'] = [];
            data['school_id'] = school_id;
            data['server_punch'] = [];
            data['punch_date'] = (new Date).toLocaleDateString();
            data['created_at'] = Date.now();
            data['created_by'] =  {
                    name: user_name,
                    user_id: user_id
                };
        }
        data.punch.push({
            punch_in: req.body.punch_in,
            punch_out: req.body.punch_out
        })
        data.server_punch.push({
            punch_in: Date.now(),
            punch_out: Date.now()
        })
        let item = {}
        if(find) {
            item = await AttendanceModel.updateOne({_id: find._id}, data);
        } else {
            item = await AttendanceModel.create(data);
        }
         
        saveActivity(user_id, user_name, "Attendance", "New Attendance has been created.", "Created");
        res.json({ status: true, result: item});
    }

    async closePunch (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let item = await AttendanceModel.findOne({school_id: school_id, 'punch_date': (new Date).toLocaleDateString()})
        let data = {};
        data = item;
        data['school_id'] = school_id;
        data.punch[data.punch.length-1].punch_out = req.body.punch_out
        data.server_punch[data.server_punch.length-1].punch_out = Date.now()
         
        await AttendanceModel.updateOne({_id: item.id}, data);
        saveActivity(user_id, user_name, "Attendance", "A Attendance has been updated.", "Updated");
        res.json({status: true})
    }

    async updatePunch (req, res) {
        let { user_id, user_name, school_id } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['school_id'] = school_id;
        data['updated_at'] = Date.now();
        data['updated_by'] =  {
                name: user_name,
                user_id: user_id
            };
         
        await AttendanceModel.updateOne({_id: id}, data);
        saveActivity(user_id, user_name, "Attendance", "A Attendance has been updated.", "Updated");
        let materials = await AttendanceModel.find({})
        res.json({status: true, result: materials})
    }
}

module.exports = attendanceController;