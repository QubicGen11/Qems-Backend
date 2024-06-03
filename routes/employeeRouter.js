const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const{createEmployee,fetchEmployeeDetails,uploadEmployeeFile,uploadFile,getAllEmployees,getEmployeeById,updateEmployee,deleteEmployee}=require('../controllers/employeeDetailController')
const employeeController=require('../controllers/employeeDetailController')

 
 
 
router.post('/employees', createEmployee);

router.get('/getemployees/:email', fetchEmployeeDetails);

 

router.post('/upload', employeeController.uploadFile,employeeController.uploadEmployeeFile );

router.get('/employees', getAllEmployees);
router.get('/employees/:id', getEmployeeById);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

module.exports = router;
