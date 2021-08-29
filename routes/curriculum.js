var express = require('express');
var router = express.Router();
var curriculumTemplateController = require('../controllers/curriculumTemplateController');
var curriculumTemplate = new curriculumTemplateController();

router.get('/getCurriculumTemplates', curriculumTemplate.getCurriculumTemplates);
router.get('/getCurriculumTemplate/:id', curriculumTemplate.getCurriculumTemplate);
router.post('/addCurriculumTemplate', curriculumTemplate.addCurriculumTemplate);
router.post('/editCurriculumTemplate', curriculumTemplate.editCurriculumTemplate);
router.delete('/deleteCurriculumTemplate/:id', curriculumTemplate.deleteCurriculumTemplate);

module.exports = router;