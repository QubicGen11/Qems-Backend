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
    try {
        const employeeData = req.body;

        // Check if employee_id is provided, otherwise generate one
        if (!employeeData.employee_id) {
            employeeData.employee_id = await generateEmployeeId();
        }

        // Create the new employee
        const employee = await prisma.employee.create({
            data: employeeData,
        });

        return res.status(201).json({ message: 'Employee created successfully', employee });
    } catch (error) {
        console.error('Error creating employee:', error);
        return res.status(500).send('Internal server error: ' + error.message);
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findUnique({
            where: {
                employee_id: id // No need to parse UUID
            }
        });
        if (!employee) {
            return res.status(404).send('Employee not found');
        }
        return res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return res.status(500).send('Internal server error: ' + error.message);
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany();
        return res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).send('Internal server error: ' + error.message);
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeData = req.body;
        const employee = await prisma.employee.update({
            where: {
                employee_id: id // No need to parse UUID
            },
            data: employeeData
        });
        return res.status(200).json({ message: 'Employee updated successfully', employee });
    } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).send('Internal server error: ' + error.message);
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.employee.delete({
            where: {
                employee_id: id // No need to parse UUID
            }
        });
        return res.status(200).send('Employee deleted successfully');
    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).send('Internal server error: ' + error.message);
    }
};

module.exports = { createEmployee, getEmployeeById, getAllEmployees, updateEmployee, deleteEmployee };
