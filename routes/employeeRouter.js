const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee, fetchEmployeeDetails,employeeImgUpload } = require('../controllers/employeeDetailController');
const multer=require('multer')

//@initiating multer code
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
const upload = multer({ storage: storage });

router.post('/employees', createEmployee);

router.get('/getemployees/:email', fetchEmployeeDetails);

// @route for uploading images

router.post('/employee/upload', upload.single('employeeImg'), async (req, res) => {
    const { companyEmail } = req.body;

    if (!companyEmail) {
        return res.status(400).send('companyEmail is required.');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const employeeImg = req.file.filename;

    try {
        await prisma.employee.update({
            where: { companyEmail },
            data: { employeeImg }
        });

        return res.status(200).send('Image upload successful');
    } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).send('Internal error: ' + error.message);
    }
});

router.get('/employees', getAllEmployees);
router.get('/employees/:id', getEmployeeById);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

module.exports = router;
