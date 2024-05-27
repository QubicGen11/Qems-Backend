const express=require('express')
const router=express.Router()
const {createEmployee,getAllEmployees,getEmployeeById,updateEmployee,deleteEmployee}=require('../controllers/employeeDetailController')
router.get('/employee',getAllEmployees)
router.get('/employee/:id',getEmployeeById)
router.post('/create',createEmployee)
router.put('/update',updateEmployee)
router.put('/delete',deleteEmployee)
module.exports=router
