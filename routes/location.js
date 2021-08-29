var express = require('express');
var router = express.Router();
var locationController = require('../controllers/locationController');
var location = new locationController();

router.get('/getLocations', location.getLocations);
router.post('/addLocation', location.addLocation);
router.get('/getLocation/:id', location.getLocation);
router.post('/editLocation', location.editLocation);
router.delete('/deleteLocation/:id', location.deleteLocation);
// router.post('/editAppointmentAbout', appointment.editAppointmentAbout);
// router.delete('/deleteAppointmentAbout/:id', appointment.deleteAppointmentAbout);

module.exports = router;