var express = require('express');
var router = express.Router();
var skillController = require('../controllers/skillsController');
var skill = new skillController();


router.post('/addSkill', skill.addSkill);
//router.post('/editSkill', student.editRelation);
router.delete('/deleteSkill/:id', skill.deleteSkill);
router.get('/getSkills', skill.getSkills);


//router.post('/confirmAdmission', skill.confirmAdmission);



module.exports = router;