var express = require('express');
var router = express.Router();
var assignmentController = require('../controllers/assignmentController');
var assignment = new assignmentController();

router.get('/getAssignments', assignment.getAssignments);
router.post('/getAssignmentsByGrade', assignment.getAssignmentsByGrade);

router.get('/getClonedAssignments', assignment.getClonedAssignments);
router.get('/getAssignment/:id', assignment.getAssignment);
router.post('/addAssignment', assignment.addAssignment);
router.post('/editAssignment', assignment.editAssignment);
router.delete('/deleteAssignment/:id', assignment.deleteAssignment);
router.post('/cloneAssignment', assignment.cloneAssignment);

module.exports = router;