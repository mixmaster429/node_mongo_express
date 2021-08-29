var express = require('express');
var router = express.Router();
var examController = require('../controllers/examController');
var exam = new examController();

router.get('/getbasedata', exam.getBaseData);
router.get('/get-exams', exam.getExams);
router.post('/get-exam/:id', exam.getExam);
router.post('/add-exam', exam.createExam);
router.post('/edit-exam/:id', exam.updateExam);
router.delete('/delete-exam/:id', exam.deleteExam);

module.exports = router;