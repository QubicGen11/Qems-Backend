const express=require('express')
const { clockIn,clockOut} = require('../controllers/attendanceController')
const router=express.Router()
router.post('/clockin',clockIn)
router.post('/clockout',clockOut)
module.exports=router