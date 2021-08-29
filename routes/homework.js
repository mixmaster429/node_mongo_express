var express = require('express');
var router = express.Router();
var homeworkController = require('../controllers/homeworkController');
var homework = new homeworkController();

router.get('/getHomeworks', homework.getHomeworks);
router.post('/getHomeworksByGrade', homework.getHomeworksByGrade);

router.get('/getClonedHomeworks', homework.getClonedHomeworks);
router.get('/getHomework/:id', homework.getHomework);
router.post('/addHomework', homework.addHomework);
router.post('/editHomework', homework.editHomework);
router.delete('/deleteHomework/:id', homework.deleteHomework);
router.post('/cloneHomework', homework.cloneHomework);

module.exports = router;