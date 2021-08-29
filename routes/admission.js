var express = require('express');
var router = express.Router();
var addmissionController = require('../controllers/admissionController');
var admission = new addmissionController();

router.get('/getAdmissions', admission.getAdmissions);
router.post('/addAdmission', admission.addAddmission);


// router.post('/editAppointmentAbout', admission.editAppointmentAbout);
// router.delete('/deleteAppointmentAbout/:id', admission.deleteAppointmentAbout);

module.exports = router;