var express = require('express');
var router = express.Router();
var holidayController = require('../controllers/holidayController');
var holiday = new holidayController();

router.get('/get-holidays', holiday.getHolidays);
router.get('/get-holidays/:school_id', holiday.getHolidays);
router.post('/get-holidays-by-grade', holiday.getHolidaysByGrade);

router.get('/get-holiday/:id', holiday.getHoliday);
router.post('/add-holiday', holiday.addHoliday);
router.post('/edit-holiday', holiday.editHoliday);
router.delete('/delete-holiday/:id', holiday.deleteHoliday);

module.exports = router;