var mongoose = require('mongoose');

var schema = mongoose.Schema({
    type_id: String,
    appointment_date: String,
    start_time: {},
    end_time: {},
    appointment_about_ids: [],
    appointment_with_student: [],
    appointment_with_parent: [],
    appointment_with_staff: [],
    phone: String,
    description: String,
    school_id: String,
    status: {},
    completed: {default: 0, type: Number},
    created_at: Date,
    updated_at: Date,
    created_by: {},
    updated_by: {}
});

module.exports = mongoose.model('AppointmentModel', schema);
