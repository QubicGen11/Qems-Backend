const express = require('express');
const {
  clockIn,
  clockOut,
  employeeReport,
  getAttendance,
  getAllAttendance,
  getAverageWorkingTime,
  singleUserAttendance,
  approveSingleAttendance,
  declineSingleAttendance
} = require('../controllers/attendanceController'); // Adjust the path as needed

const router = express.Router();

router.post('/clockin', clockIn);
router.post('/clockout', clockOut);
router.post('/report', employeeReport);
router.get('/attendance/:email', getAttendance);
router.get('/allattendance/:employeeId/:year?/:month?/:week?', getAllAttendance);
router.get('/averageworkingtime/:employeeId', getAverageWorkingTime);
router.get('/singleUserAttendance/:employeeId', singleUserAttendance);
router.post('/approveAttendance', approveSingleAttendance);
router.post('/declineAttendance', declineSingleAttendance);

module.exports = router;
