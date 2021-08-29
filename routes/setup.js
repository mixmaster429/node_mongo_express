var express = require('express');
var router = express.Router();
var setupController = require('../controllers/setupController');
var setup = new setupController();

router.post('/addAcademicYear', setup.addAcademicYear);
router.post('/editAcademicYear', setup.editAcademicYear);
router.get('/getAcademicYear', setup.getAcademicYear);
router.delete('/deleteAcademicYear/:id', setup.deleteAcademicYear);

router.post('/addSession', setup.addSession);
router.get('/getSessions', setup.getSessions);
router.get('/getSession/:academic_year_id', setup.getSession);
router.post('/editSession', setup.editSession);
router.get('/changeSessionStatus/:id', setup.changeSessionStatus);
router.delete('/deleteSession/:id', setup.deleteSession);

router.post('/addSchoolGrades', setup.addSchoolGrades);
router.post('/editSchoolGrades', setup.editSchoolGrades);
router.get('/getSchoolGrades', setup.getSchoolGrades);
router.delete('/deleteSchoolGrades/:id', setup.deleteSchoolGrades);

router.post('/addSubjectType', setup.addSubjectType);
router.post('/editSubjectType', setup.editSubjectType);
router.get('/getSubjectType', setup.getSubjectType);
router.delete('/deleteSubjectType/:id', setup.deleteSubjectType);

router.post('/addDepartment', setup.addDepartment);
router.post('/editDepartment', setup.editDepartment);
router.get('/getDepartment', setup.getDepartment);
router.delete('/deleteDepartment/:id', setup.deleteDepartment);

router.post('/addSubject', setup.addSubject);
router.post('/editSubject', setup.editSubject);
router.get('/getSubject', setup.getSubject);
router.delete('/deleteSubject/:id', setup.deleteSubject);

router.post('/addSource', setup.addSource);
router.post('/editSource', setup.editSource);
router.get('/getSource', setup.getSource);
router.delete('/deleteSource/:id', setup.deleteSource);

router.post('/addRole', setup.addRole);
router.post('/editRole', setup.editRole);
router.get('/getRoles', setup.getRoles);
router.post('/getStaffRolesBySchoolId', setup.getStaffRolesBySchoolId);
router.get('/getStaffRolesBySchool', setup.getStaffRolesBySchool);

router.get('/getStaffRolesUnderSchoolsDistrict', setup.getStaffRolesUnderSchoolsDistrict);

router.get('/getRole/:id', setup.getRole);
router.delete('/deleteRole/:id', setup.deleteRole);


router.post('/addRoom', setup.addRoom);
router.post('/editRoom', setup.editRoom);
router.post('/getRooms', setup.getRooms);
router.get('/getRoom/:id', setup.getRoom);
router.delete('/deleteRoom/:id', setup.deleteRoom);
router.get('/getLocationRemainingCapacity/:id', setup.getLocationRemainingCapacity);

router.post('/emailSMS/addEmailConfig', setup.addEmailConfig);
router.post('/emailSMS/editEmailConfig', setup.editEmailConfig);
router.get('/emailSMS/getEmailConfig', setup.getEmailConfig);
router.delete('/emailSMS/deleteEmailConfig/:id', setup.deleteEmailConfig);

router.post('/emailSMS/addEmailTemplate', setup.addEmailTemplate);
router.post('/emailSMS/editEmailTemplate', setup.editEmailTemplate);
router.get('/emailSMS/getEmailTemplates', setup.getEmailTemplates);
router.get('/emailSMS/getEmailTemplate/:id', setup.getEmailTemplate);
router.delete('/emailSMS/deleteEmailTemplate/:id', setup.deleteEmailTemplate);

router.get('/emailSMS/getEmailLogs', setup.getEmailLogs);

router.post('/emailSMS/addSmsTemplate', setup.addSmsTemplate);
router.post('/emailSMS/editSmsTemplate', setup.editSmsTemplate);
router.get('/emailSMS/getSmsTemplates', setup.getSmsTemplates);
router.get('/emailSMS/getSmsTemplate/:id', setup.getSmsTemplate);
router.delete('/emailSMS/deleteSmsTemplate/:id', setup.deleteSmsTemplate);

router.post('/emailSMS/addBankDetail', setup.addBankDetail);
router.post('/emailSMS/editBankDetail', setup.editBankDetail);
router.get('/emailSMS/getBankDetail', setup.getBankDetail);
router.delete('/emailSMS/deleteBankDetail/:id', setup.deleteBankDetail);

router.get('/emailSMS/getSmsLogs', setup.getSmsLogs);


router.get('/getPreGradeSelection', setup.getPreGardingSelection)
router.post('/updatePreGradeSelection', setup.updatePreGardingSelection)



router.get('/getImmunizations',setup.getImmunizations)
router.post('/addImmunization',setup.addImmunizations)
router.delete('/deleteImmunization/:id',setup.deleteImmunization)
router.post('/addAllergy',setup.addAllergy)
router.get('/getAllergies',setup.getAllergies)
router.delete('/deleteAllergy/:id',setup.deleteAllegry)


router.post('/addCountry',setup.addCountry)
router.get('/getCountries',setup.getCountries)
router.delete('/deleteCountry/:id',setup.deleteCountry)



router.post('/addState',setup.addState)
router.get('/getStates/:country',setup.getStates)
router.delete('/deleteState/:id',setup.deleteState)



router.post('/addCity',setup.addCity)
router.get('/getCities/:state',setup.getCities)
router.delete('/deleteCity/:id',setup.deleteCity)

router.get('/getSources',setup.getSources)
router.post('/addSources',setup.addSources)
//router.delete('/deleteSource/:id',setup.deleteSource)

router.post('/getSubjectsByGrade',setup.getSubjectsByGrade)
router.post('/getClassesBySubject',setup.getClassesBySubject)
router.post('/getAllStudentsUnassignedAndAssigned',setup.getAllStudentsUnassignedAndAssigned)
router.post('/assignStudentsToClass',setup.assignStudentsToClass)

router.get('/grade-scale', setup.getGradingScales)
router.post('/grade-scale', setup.addGradingScales)
router.put('/grade-scale/:id', setup.updateGradingScales)
router.delete('/grade-scale/:id', setup.deleteGradingScales)
router.get('/grade-scale/scale', setup.getScalesBase)
router.get('/grade-scale/scale/:id', setup.getScalesOfGrading)
router.put('/grade-scale/scale/:id', setup.updateScalesOfGrading)




module.exports = router;