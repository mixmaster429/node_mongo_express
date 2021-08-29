var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
var user = new userController();

router.get('/loadPermission', user.loadPermission);
router.post('/createAdmin', user.createAdmin);
router.post('/createStaff', user.createStaff);
router.post('/updateStaff', user.updateStaff);

router.get('/getAdmins', user.getAdmins);
router.get('/getStaffUnderSchoolsDistricts', user.getStaffUnderSchoolsDistricts);
router.get('/getSchoolsUnderDistrict', user.getSchoolsUnderDistrict);
router.get('/getStaffUnderSchool', user.getStaffUnderSchool);



router.get('/getTeachers', user.getTeachers);
router.post('/changeStatus', user.changeStatus);
router.post('/generateStudentPassword', user.generateStudentPassword);
router.post('/generateParentPassword', user.generateParentPassword);


router.delete('/deleteAdmin/:id', user.deleteAdmin);
router.get('/getAdmin/:id', user.getAdmin);
router.post('/updateAdmin', user.updateAdmin);
router.post('/updatePhysicalInfo', user.updatePhysicalInfo);

router.post('/makeStudent', user.makeStudent);
router.get('/getStudents', user.getStudents);
router.get('/getStudent/:id', user.getStudent);
//router.post('/updateStudent', user.updateStudent);
router.get('/getParents', user.getParents);
router.get('/getStudentParents/:id/:pickup', user.getStudentParents);
router.post('/addParent', user.addParent);
router.put('/editParent/:parent_id', user.editParent);

router.post('/addUpdateStudentSkills', user.addUpdateStudentSkills);
router.post('/promoteStudent', user.promoteStudent);
router.get('/getUserById/:user_id', user.getUserById);

// Send SMS notification
router.post('/sendSMS', user.sendSMS);


module.exports = router;