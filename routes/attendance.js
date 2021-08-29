var express = require('express');
var router = express.Router();
var attendanceController = require('../controllers/attendanceController');
var attendance = new attendanceController();

router.get('', attendance.getAttendances);
router.get('/:id', attendance.getPunches);
router.post('/punch', attendance.createPunch);
router.put('/punch', attendance.closePunch);
router.put('/punch/:id', attendance.updatePunch);

module.exports = router;