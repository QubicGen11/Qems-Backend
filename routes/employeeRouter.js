const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeDetailController');
const employeeLeaveController = require('../controllers/employeeLeaveController');
const {
  createEmployee,
  fetchEmployeeDetails,
  fetchEmployeeDataById,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  uploadFile,
  uploadEmployeeFile
} = employeeController;

  const {
    getEmployeeById: getEmployeeByIdFromLeave,
    getEmployeeByEmail,
    updateEmployeeImage
} = require('../controllers/employeeLeaveController');

// Define your routes
router.post('/employees', createEmployee);
router.get('/getemployees/:email', fetchEmployeeDetails);
router.get('/employees/:id', getEmployeeById);
router.get('/employees', getAllEmployees);
router.get('/employee/:employeeId', fetchEmployeeDataById);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:employeeId', deleteEmployee);

// Employee routes from employeeController
router.get('/getemployee/:id', getEmployeeByIdFromLeave);
router.get('/getemployeebyemail/:email', getEmployeeByEmail);
router.put('/updateemployeeimage/:id', updateEmployeeImage);

// Since you mentioned not using Multer, I'll assume you want to handle file uploads directly via base64
// If using Multer, uncomment the following line
// router.post('/upload', uploadFile, uploadEmployeeFile);

// Direct file upload without Multer (assuming you receive a base64 encoded string in the request body)
router.post('/upload', uploadEmployeeFile);

module.exports = router;
