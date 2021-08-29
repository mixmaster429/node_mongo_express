var express = require('express');
var router = express.Router();
var feeCategoryController = require('../controllers/feecategoryController');
var feeCategory = new feeCategoryController();

var feeGroupController = require('../controllers/feegroupController');
var feeGroup = new feeGroupController();

var feeHeadController = require('../controllers/feeheadController');
var feeHead = new feeHeadController();

router.get('/category', feeCategory.getCategories);
router.post('/category', feeCategory.createCategory);
router.put('/category/:id', feeCategory.updateCategory);
router.delete('/category/:id', feeCategory.deleteCategory);

router.get('/groups', feeGroup.getGroups);
router.post('/group', feeGroup.createGroup);
router.put('/group/:id', feeGroup.updateGroup);
router.delete('/group/:id', feeGroup.deleteGroup);

router.get('/heads', feeHead.getHeads);
router.post('/head', feeHead.createHead);
router.put('/head/:id', feeHead.updateHead);
router.delete('/head/:id', feeHead.deleteHead);

module.exports = router;