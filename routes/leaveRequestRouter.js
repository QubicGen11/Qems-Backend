const express = require('express')
const {
    employeeLeaveRequest,
    allLeaveRequests,
    approveLeaveRequests,
    declineLeaveRequests,
    createNewHoliday,
    deleteHoliday,
    allHolidays,
    getLeaveRequestsByEmail
} = require('../controllers/employeeLeaveController')
const router = express.Router()
router.post('/newleaverequest', employeeLeaveRequest)
router.get('/allleaverequests', allLeaveRequests)
router.post('/approveleaves', approveLeaveRequests)
router.post('/declineleaves', declineLeaveRequests)
router.post('/createholiday', createNewHoliday)
router.delete('/deleteholiday/:holidayName', deleteHoliday)
router.get('/allholidays', allHolidays)
router.get('/getleaverequests/:email', getLeaveRequestsByEmail)
module.exports = router