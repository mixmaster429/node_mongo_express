var express = require('express');
var router = express.Router();
var lectureController = require('../controllers/lectureController');
var lecture = new lectureController();

router.get('/getLectures', lecture.getLectures);
router.get('/getLecture/:id', lecture.getLecture);
router.post('/addLecture', lecture.addLecture);
router.delete('/deleteLecture/:id', lecture.deleteLecture);
router.post('/editLecture', lecture.editLecture);
// router.delete('/deleteAppointmentAbout/:id', appointment.deleteAppointmentAbout);

module.exports = router;