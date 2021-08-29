var express = require('express');
var router = express.Router();
var followUpController = require('../controllers/followUpController');
var followUp = new followUpController();

router.get('/getFollowUps/:student_id', followUp.getStudentFollowUps);
router.post('/addFollowUp', followUp.addFollowUp);
router.get('/getFollowUp/:id', followUp.getFollowUp);
router.delete('/deleteFollowUp/:id', followUp.deleteFollowUp);
router.post('/editFollowUp', followUp.editFollowUp);
// router.post('/editAppointmentAbout', admission.editAppointmentAbout);
// router.delete('/deleteAppointmentAbout/:id', admission.deleteAppointmentAbout);

module.exports = router;