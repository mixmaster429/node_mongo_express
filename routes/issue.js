var express = require('express');
var router = express.Router();
var issueController = require('../controllers/issueController');
var issue = new issueController();

router.get('/getIssues', issue.getIssues);
router.get('/getIssue/:id', issue.getIssue);
router.post('/addIssue', issue.addIssue);
router.delete('/deleteIssue/:id', issue.deleteIssue);
router.put('/editIssue', issue.editIssue);
router.post('/addComment', issue.addComment);
router.put('/changeStatus', issue.changeStatus);

module.exports = router;