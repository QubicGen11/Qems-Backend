const express=require('express')
const { clockIn,clockOut,getAttendance,employeeReport} = require('../controllers/attendanceController')
const router=express.Router()
router.post('/clockin',clockIn)
router.post('/clockout',clockOut)
router.post('/report',employeeReport)
router.get('/attendance/:email',getAttendance)
module.exports=router