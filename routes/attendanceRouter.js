const express=require('express')
const router=express.Router()
const {userClockin,userClockout}=require('../controllers/attendanceController')
router.post('/clockin',userClockin)
router.post('/clockout',userClockout)

module.exports=router