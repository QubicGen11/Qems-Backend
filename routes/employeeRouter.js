    const express = require('express');
    const router = express.Router();
    const { PrismaClient } = require('@prisma/client');
    const employeeController=require('../controllers/employeeDetailController')
    const prisma = new PrismaClient();
    const{createEmployee,fetchEmployeeDetails,uploadEmployeeFile,uploadFile,getAllEmployees,getEmployeeById,updateEmployee,deleteEmployee,fetchEmployeeDetailById}=require('../controllers/employeeDetailController')

    
    
    
    router.post('/employees', createEmployee);

    router.get('/getemployees/:email/:employeeId?', fetchEmployeeDetails);
    


    router.post('/upload', employeeController.uploadFile,employeeController.uploadEmployeeFile );

    router.get('/employees', getAllEmployees);
    router.get('/employees/:id', getEmployeeById);
    router.put('/employees/:id', updateEmployee);
    router.delete('/employees/:id', deleteEmployee);

    module.exports = router;
