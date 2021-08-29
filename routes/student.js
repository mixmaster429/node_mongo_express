var express = require('express');
var router = express.Router();
var studentController = require('../controllers/studentController');
var student = new studentController();

router.get('/getRelations', student.getRelations);
router.post('/addRelation', student.addRelation);
router.post('/editRelation', student.editRelation);
router.delete('/deleteRelation/:id', student.deleteRelation);
router.get('/getAdmissions/:is_confirm', student.getAdmissions);
router.post('/addAdmission', student.addAddmission);
router.get('/getAdmission/:id', student.getAdmission);
router.delete('/deleteAdmission/:id', student.deleteAdmission);
router.post('/updateAdmission', student.updateAdmission);

router.post('/confirmAdmission', student.confirmAdmission);

module.exports = router;