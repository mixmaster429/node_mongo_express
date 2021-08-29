var express = require('express');
var router = express.Router();
var appointmentController = require('../controllers/appointmentController');
var appointment = new appointmentController();

router.get('/about/:school_id', appointment.getAppointmentAbouts);
router.get('/about/', appointment.getAppointmentAbouts);
router.post('/about', appointment.addAppointmentAbout);
router.put('/about', appointment.editAppointmentAbout);
router.delete('/about/:id', appointment.deleteAppointmentAbout);
router.get('/base/:school_id', appointment.getAppointmentBase);
router.get('/base', appointment.getAppointmentBase);
router.get('/', appointment.getAppointments);
router.get('/all/', appointment.getAppointments);
router.get('/all/:school_id', appointment.getAppointments);
router.get('/:id', appointment.getAppointment);
router.post('/', appointment.addAppointment);
router.put('/:id', appointment.editAppointment);
router.delete('/:id', appointment.deleteAppointment);

module.exports = router;