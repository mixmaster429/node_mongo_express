var express = require('express');
var router = express.Router();
var eventsController = require('../controllers/eventsController');
var events = new eventsController();

router.post('/addEvent', events.addEvent);
router.get('/getEvents', events.getEvents);
router.get('/getEvent/:id', events.getEvent);
router.post('/editEvent', events.editEvent);
router.delete('/deleteEvent/:id', events.deleteEvent);

router.post('/addRegistration', events.addRegistration);
router.get('/getRegistrations', events.getRegistrations);
router.get('/getRegistration/:id', events.getRegistration);
router.post('/editRegistration', events.editRegistration);
router.delete('/deleteRegistration/:id', events.deleteRegistration);

router.post('/addGallery', events.addGallery);
router.get('/getGallerys', events.getGallerys);
router.get('/getGallery/:id', events.getGallery);
router.post('/editGallery', events.editGallery);
router.delete('/deleteGallery/:id', events.deleteGallery);

router.post('/addAlbum', events.addAlbum);
router.get('/getAlbums/:gallery_id', events.getAlbums);
router.delete('/deleteAlbum/:id', events.deleteAlbum);

module.exports = router;