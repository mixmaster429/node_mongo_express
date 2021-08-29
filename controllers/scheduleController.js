const ClassModel = require('../models/class');
const AppointmentModel = require('../models/appointment');
const eventsModel = require('../models/events');
const AssignmentModel = require('../models/assignment');
const FollowUpModel = require('../models/followUp');
const HolidayModel = require('../models/holiday');
const { saveActivity } = require('./activityUtil');


class scheduleController {
    async getSchedules(req, res) {
        try {
            let { user_id } = req.headers
            let { school_id } = req.params
            let school_id_query = (school_id && school_id != '') ? {school_id: school_id} : {};
            
            let appointments  = await AppointmentModel.find(school_id_query)
            appointments = appointments.filter((e) => {
                if (e.created_by.user_id == user_id) return true;
                if (e.appointment_with_parent.some((e) => e.user_id == user_id)) return true;
                if (e.appointment_with_student.some((e) => e.user_id == user_id)) return true;
                if (e.appointment_with_staff.some((e) => e.user_id == user_id)) return true;
                return false;
            });

            let assignments = await AssignmentModel.find(school_id_query)

            let followup = await FollowUpModel.find({"created_by.user_id": user_id})

            let events = await eventsModel.find(school_id_query)

            let holidays = await HolidayModel.find(school_id_query);

            let homeworks = [];

            let exams = [];
            
            let classes = await ClassModel.find(school_id_query).populate("standard_grade_id", ["name", "position"]).populate('subject_id', ["name", "department", "grade", "type"])
            
            res.json({ status: true, result: {
                classes: classes,
                appointments: appointments,
                assignments: assignments,
                followup: followup,
                events: events,
                holidays: holidays,
                homeworks: homeworks,
                exams: exams
            } });
        } catch (e) {
            res.json({status: false, error: 'gettiing error'})
        }
    }

}

module.exports = scheduleController;