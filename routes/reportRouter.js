const {createReport,fetchReports}=require('../controllers/employeeReportController')
const express=require('express')
const router=express.Router()

router.post('/report',createReport)
router.get('/report/:email',fetchReports)

module.exports=router