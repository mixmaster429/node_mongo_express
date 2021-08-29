var express = require('express');
var router = express.Router();
var classCurriculumController = require('../controllers/classCurriculumController');
var classCurriculum = new classCurriculumController();


router.get('/getClassCurriculum/:id', classCurriculum.getClassCurriculum);
router.post('/addClassCurriculum', classCurriculum.addClassCurriculum);
router.post('/updateClassCurriculum', classCurriculum.updateClassCurriculum);
router.post('/searchClassCurriculum', classCurriculum.searchClassCurriculum);
router.delete('/deleteClassCurriculum/:id', classCurriculum.deleteClassCurriculum);



module.exports = router;