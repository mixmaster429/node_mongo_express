var express = require('express');
var router = express.Router();
var homeworkGradeController = require('../controllers/homeWorkGradesController');
var homeworkgrade = new homeworkGradeController();

router.get('/getHomeWorkGrades', homeworkgrade.getHomeWorkGrades);
// router.get('/getHomework/:id', homework.getHomework);
// router.post('/addHomework', homework.addHomework);
// router.post('/editHomework', homework.editHomework);
// router.delete('/deleteHomework/:id', homework.deleteHomework);

module.exports = router;