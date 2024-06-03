const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    const { firstname, lastname, dob, gender, address, phone, position, email, linkedin, education, skills, about, companyEmail } = req.body;
    try {
        const employeeId = await generateEmployeeId();
        const employee = await prisma.employee.create({
            data: {
                employee_id: employeeId,
                firstname: firstname || null,
                lastname: lastname || null,
                dob: dob ? new Date(dob) : null,
                gender: gender || null,
                address: address || null,
                phone: phone || null,
                email: email,
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
        res.status(201).json(employee);
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
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await prisma.employee.findUnique({
            where: { employee_id: id }
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

const getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany();
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, dob, gender, address, phone, position, email, linkedin, about } = req.body;

    try {
        const employee = await prisma.employee.update({
            where: { employee_id: id },
            data: {
                firstname: firstname || null,
                lastname: lastname || null,
                dob: dob ? new Date(dob) : null,
                gender: gender || null,
                address: address || null,
                phone: phone || null,
                email: email,
                position: position,
                linkedin: linkedin || null,
                about: about || null,
                updatedAt: new Date()
            }
        });
        res.status(200).json(employee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.employee.delete({
            where: { employee_id: id }
        });
        res.status(204).send('Successfully deleted employee');
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const fetchEmployeeDetails = async (req, res) => {
    const { email } = req.params; // Destructure email from the request body
    try {
        const getData = await prisma.employee.findFirst({
            where: { companyEmail: email } // Properly specify the condition in the query
        });
        if (!getData) {
            return res.status(400).send('Employee data is not available');
        }
        return res.status(200).json([getData]); // Wrap the response in an array
    } catch (error) {
        return res.status(500).send('Internal server error: ' + error.message);
    }
};

const employeeImgUpload = async (req, res) => {
    const { companyEmail } = req.body;
    const employeeImg = req.file.filename;
    try {
        await prisma.employee.update({
            where: {
                companyEmail: companyEmail
            },
            data: {
                employeeImg: employeeImg
            }
        });
        return res.status(200).send('Image upload successful');
    } catch (error) {
        return res.status(500).send('Internal error: ' + error.message);
    }
};

module.exports = { createEmployee, getEmployeeById, getAllEmployees, updateEmployee, deleteEmployee, fetchEmployeeDetails, employeeImgUpload };
