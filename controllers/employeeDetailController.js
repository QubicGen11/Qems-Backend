const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Uploads directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const generateEmployeeId = async () => {
    const prefix = 'QG24';
    const lastEmployee = await prisma.employee.findFirst({
        orderBy: { employee_id: 'desc' },
    });
    let newIdNumber;
    if (lastEmployee) {
        const lastIdNumber = parseInt(lastEmployee.employee_id.slice(prefix.length));
        newIdNumber = lastIdNumber + 1;
    } else {
        newIdNumber = 1;
    }
    return `${prefix}${newIdNumber.toString().padStart(3, '0')}`;
};

const createEmployee = async (req, res) => {
    const { firstname, lastname, dob, gender, address, phone, position, email,department, linkedin, education, skills, about, companyEmail } = req.body;
    try {
        const employeeId = await generateEmployeeId();
        const dobDate = dob ? new Date(dob) : null;

        // Verify that the dob is a valid date
        if (dobDate && isNaN(dobDate.getTime())) {
            throw new Error('Invalid date format for dob');
        }

        const employee = await prisma.employee.create({
            data: {
                employee_id: employeeId,
                firstname: firstname || null,
                lastname: lastname || null,
                dob: dobDate,
                gender: gender || null,
                address: address || null,
                phone: phone || null,
                email: email,
                department:department,
                position: position,
                education: education,
                skills: skills,
                linkedin: linkedin || null,
                about: about || null,
                companyEmail: companyEmail,
                hireDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        
        if (companyEmail) {
            await prisma.user.update({
                where: {
                    email: companyEmail
                },
                data: {
                    employeeId: employeeId,
                }
            });
        }

        res.status(201).json(employee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await prisma.employee.findUnique({
            where: { employee_id: id },
            include: {
                users: true, // Include related User model
            },
        });

        if (employee) {
            res.status(200).json(employee);
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, dob, gender, address, phone, position, email, linkedin, about, education, skills } = req.body;

    try {
        console.log('Update request received for employee ID:', id);
        console.log('Data received:', req.body);

        const existingEmployee = await prisma.employee.findUnique({
            where: { employee_id: id }
        });

        if (!existingEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        const dobDate = dob ? new Date(dob) : null;
        // Verify that the dob is a valid date
        if (dobDate && isNaN(dobDate.getTime())) {
            throw new Error('Invalid date format for dob');
        }

        const employee = await prisma.employee.update({
            where: { employee_id: id },
            data: {
                firstname: firstname || null,
                lastname: lastname || null,
                dob: dobDate,
                gender: gender || null,
                address: address || null,
                phone: phone || null,
                email: email,
                position: position,
                linkedin: linkedin || null,
                about: about || null,
                education: education || null,
                skills: skills || null,
                updatedAt: new Date()
            }
        });
        console.log('Updated employee:', employee);
        res.status(200).json(employee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteEmployee = async (req, res) => {
    const { employeeId } = req.params;
    console.log('Employee ID:', employeeId); // Debugging line
    try {
      if (!employeeId) {
        return res.status(400).send('Employee ID is required');
      }
  
      // Delete related attendance records
      await prisma.attendance.deleteMany({
        where: { employee_id: employeeId }
      });
  
      // Delete related salary records (if any)
      await prisma.salary.deleteMany({
        where: { employee_id: employeeId }
      });
  
      // Delete the employee record
      await prisma.employee.delete({
        where: { employee_id: employeeId }
      });
  
      res.status(204).send('Successfully deleted employee');
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
const getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            include: { users: true }, // Include related User model
        });
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const fetchEmployeeDetails = async (req, res) => {
    const { email,employeeId } = req.params;
    try {
        const getData = await prisma.employee.findFirst({
            where: { companyEmail: email },
            include: {
                users: true, 
            },
            
        });
        const getDataById=await prisma.employee.findFirst({
            where:{
                employee_id:employeeId
            }
        })
        if (!getData || !getDataById) {
            return res.status(400).send('Employee data is not available');
        }
        return res.status(200).json(getData); // Return the data directly
        return res.status(200).json(getDataById)
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).send('Internal server error: ' + error.message);
    }
};

 const fetchEmployeeDataById=async(req,res)=>{
    const employeeId=req.params
    try {
        const getEmployeeData=await prisma.employee.findFirst({
            where:{
                employee_id:employeeId
            }
        })
        if(!getEmployeeData){
            return res.status(400).send('employee data not found')
        }
        return res.status(200).send(getEmployeeData)
    } catch (error) {
        return res.status(500).send('Internal error'+error.message)
    }
 }

const uploadEmployeeFile = async (req, res) => {
    const { email } = req.body;
    const file = req.file;

    if (!email || !file) {
        return res.status(400).send('Email and file are required.');
    }

    try {
        const existingEmployee = await prisma.employee.findFirst({
            where: { companyEmail: email },
        });

        if (!existingEmployee) {
            return res.status(400).send('Employee not found.');
        }

        const updatedEmployee = await prisma.employee.update({
            where: { employee_id: existingEmployee.employee_id },
            data: {
                employeeImg: file.path,
            },
        });

        res.status(200).json({ message: 'File uploaded successfully', updatedEmployee });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Internal server error');
    }
};

 
const uploadFile = upload.single('file');
module.exports = { createEmployee, getEmployeeById, getAllEmployees, updateEmployee, deleteEmployee, fetchEmployeeDetails, fetchEmployeeDataById,uploadEmployeeFile, uploadFile };
