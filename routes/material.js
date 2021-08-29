var express = require('express');
var router = express.Router();
var materialController = require('../controllers/materialController');
var material = new materialController();

router.get('', material.getMaterials);
router.post('/', material.createMaterial);
router.get('/base', material.getBaseData);
router.get('/:id', material.getMaterial);
router.put('/:id', material.updateMaterial);
router.delete('/:id', material.deleteMaterial);


module.exports = router;