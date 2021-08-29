const AppointmentAboutModel = require('../models/appointmentAbout');
const AppointmentModel = require('../models/appointment');
const User = require('../models/users');
const RoleModel = require('../models/roles');
const { saveActivity } = require('./activityUtil');
const crypto = require('crypto');
const roles = require('../models/roles');

class appointmentController {

    async getAppointmentAbouts(req, res) {
        let { school_id } = req.params;
        let AppointmentAbouts = [];
        if (school_id && school_id != '')
            AppointmentAbouts = await AppointmentAboutModel.find({school_id: school_id});
        else
            AppointmentAbouts = await AppointmentAboutModel.find({});
            res.json({ status: true, result: AppointmentAbouts });
    }

    async addAppointmentAbout(req, res) {
        let { name, school_id } = req.body;
        let { user_id, user_name } = req.headers;
        await AppointmentAboutModel.create({
            name: name,
            school_id: school_id,
            created_at: Date.now(),
            created_by: {
                user_id: user_id,
                user_name: user_name
            }
        });
        saveActivity(user_id, user_name, "Appointment", "New Appointment About has been created.", "Created");
        res.json({ status: true });
    }

    async editAppointmentAbout(req, res) {
        let { id, name, school_id } = req.body;
        let { user_id, user_name } = req.headers;
        try {
            await AppointmentAboutModel.updateOne({
                _id: id
            }, {
                name: name,
                school_id: school_id,
                updated_at: Date.now(),
                updated_by: {
                    user_id: user_id,
                    user_name: user_name
                }
            })
            saveActivity(user_id, user_name, "Appointment", "An Appointment About has been created.", "Updated");
            res.json({
                status: true
            });
        } catch (e) {
            res.json({
                status: false,
                result: e
            });
        }
    }

    async deleteAppointmentAbout(req, res) {
        let { id } = req.params;
        let { user_id, user_name } = req.headers;
        await AppointmentAboutModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Appointment", "An Appointment About has been deleted.", "Deleted");
        res.json({ status: true });
    }
    async getAppointmentBase(req, res) {
        let { school_id } = req.params;
        let { user_id } = req.headers;
        let school_id_query = (school_id && school_id != '') ? {school_id: school_id} : {};
        let AppointmentAbouts = await AppointmentAboutModel.find(school_id_query).select('name');

        let role = await RoleModel.find({
            weight: {
                $gt: 3
            }
        });
        let roles = {
            parent: [],
            student: [],
            staff: []
        }
        let ids = []
        role.map(e => {
            if (e.weight == 5) {
                roles.student.push(e._id.toString())
            } else if (e.weight == 6) {
                roles.parent.push(e._id.toString())
            } else {
                roles.staff.push(e._id.toString())
            }
            ids.push(e._id)
        })

        let users = await User.find({
            ...school_id_query,
            role_id: {
                $in: ids
            }
        }).select('user_id email personal_info.first_name personal_info.last_name role_id created_by');
        let result = {
            parent: [],
            student: [],
            staff: []
        }
        users.forEach(e => {
            let row = Object.assign({}, e)._doc
            row.itemName = row.personal_info.first_name + ' ' + row.personal_info.last_name
            delete row.personal_info
            if (roles.student.includes(row.role_id)) {
                result.student.push(row)
            } else if (roles.parent.includes(row.role_id)) {
                result.parent.push(row)
            } else {
                result.staff.push(row)
            }
        })
        res.json({
            status: true,
            result: {
                about: AppointmentAbouts,
                users: result
            }
        });
    }
    async getAppointments(req, res) {
        let { school_id } = req.params;
        let { user_id, owner_id } = req.headers
        let school_id_query = (school_id && school_id != '') ? {school_id: school_id} : {};

        let appointments = await AppointmentModel.find({
            ...school_id_query
        }).sort('appointment_date start_time.hour');
        appointments = appointments.filter((e) => {
            if (e.created_by.user_id == user_id) return true;
            if (e.appointment_with_parent.some((e) => e.user_id == user_id)) return true;
            if (e.appointment_with_student.some((e) => e.user_id == user_id)) return true;
            if (e.appointment_with_staff.some((e) => e.user_id == user_id)) return true;
            return false;
        });
        res.json({
            status: true,
            result: appointments
        });
    }
    async getAppointment(req, res) {
        let {
            id
        } = req.params
        let item = await AppointmentModel.findOne({
            _id: id
        });
        res.json({
            status: true,
            result: item
        });
    }
    async addAppointment(req, res) {
        let { user_id, user_name } = req.headers;
        let data = req.body
        data['created_at'] = Date.now();
        data['created_by'] = {
            name: user_name,
            user_id: user_id
        };
        await AppointmentModel.create(data);
        saveActivity(user_id, user_name, "Appointment", "New Appointment About has been created.", "Created");
        res.json({
            status: true
        });
    }
    async editAppointment(req, res) {
        let { user_id, user_name } = req.headers;
        let { id } = req.params;
        let data = req.body
        data['updated_at'] = Date.now();
        data['updated_by'] = {
            name: user_name,
            user_id: user_id
        };

        await AppointmentModel.updateOne({
            _id: id
        }, data);
        saveActivity(user_id, user_name, "Appointment", "A Appointment has been updated.", "Updated");
        res.json({ status: true })
    }
    async deleteAppointment(req, res) {
        let { id } = req.params
        let { user_id, user_name } = req.headers;
        await AppointmentModel.deleteOne({ _id: id });
        saveActivity(user_id, user_name, "Appointment", "An Appointment About has been deleted.", "Deleted");
        res.json({ status: true })
    }
}

module.exports = appointmentController;