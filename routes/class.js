var express = require('express');
var router = express.Router();
var classController = require('../controllers/classController');
var classObj = new classController();

router.get('/getClasses', classObj.getClasses);
router.get('/getClonedClasses', classObj.getClonedClasses);

router.post('/getClassesByGrade', classObj.getClassesByGrade);

router.post('/addClass', classObj.addClass);
router.get('/getClass/:id', classObj.getClass);
router.post('/editClass', classObj.editClass);
router.post('/cloneClass', classObj.cloneClass);

router.delete('/deleteClass/:id', classObj.deleteClass);

module.exports = router;