const express=require('express')
const { clockIn,clockOut,getAttendance,employeeReport,getAllAttendance,getAverageWorkingTime, singleUserAttendance, approveSingleAttendance, declineSingleAttendance,  } = require('../controllers/attendanceController')
const router=express.Router()
router.post('/clockin',clockIn)
router.post('/clockout',clockOut)
router.post('/report',employeeReport)
router.post('/approveAttendance',approveSingleAttendance)
router.post('/declineAttendance',declineSingleAttendance)
router.get('/attendance/:email',getAttendance)
router.get('/allAttendance/:year?/:month?/:week?/:department?',getAllAttendance)
router.get('/singleUserAttendance/:employeeId/:year?/:month?/:week?', singleUserAttendance);
router.get('/allAttendance/:employeeId',getAverageWorkingTime)
module.exports=router