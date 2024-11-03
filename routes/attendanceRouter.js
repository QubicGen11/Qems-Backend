const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/clockin', attendanceController.clockIn);
router.post('/clockout', attendanceController.clockOut);
router.post('/report', attendanceController.employeeReport);
router.post('/approveAttendance', attendanceController.approveSingleAttendance);
router.post('/declineAttendance', attendanceController.declineSingleAttendance);
router.get('/attendance/:email', attendanceController.getAttendance);
router.get('/allAttendance/:year?/:month?/:week?/:department?', attendanceController.getAllAttendance);
router.get('/singleUserAttendance/:employeeId/:year?/:month?/:week?', attendanceController.singleUserAttendance);
router.get('/allAttendance/:employeeId', attendanceController.getAverageWorkingTime);
router.get('/clockstatus/:email', attendanceController.getClockStatus);

module.exports = router;