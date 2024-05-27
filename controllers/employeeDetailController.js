const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const createEmployee = async (req, res) => {
    try {
        const employeeData = req.body;
        const employee = await prisma.employee.create({
            data: employeeData
        });
        return res.status(201).json({ message: 'Employee created successfully', employee });
    } catch (error) {
        return res.status(500).send('Internal server error: ' + error.message);
    }
};
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findUnique({
            where: {
                employee_id: parseInt(id)
            }
        });
        if (!employee) {
            return res.status(404).send('Employee not found');
        }
        return res.status(200).json(employee);
    } catch (error) {
        return res.status(500).send('Internal server error: ' + error.message);
    }
};
const getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany();
        return res.status(200).json(employees);
    } catch (error) {
        return res.status(500).send('Internal server error: ' + error.message);
    }
};
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeData = req.body;
        const employee = await prisma.employee.update({
            where: {
                employee_id: parseInt(id)
            },
            data: employeeData
        });
        return res.status(200).json({ message: 'Employee updated successfully', employee });
    } catch (error) {
        return res.status(500).send('Internal server error: ' + error.message);
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.employee.delete({
            where: {
                employee_id: parseInt(id)
            }
        });
        return res.status(200).send('Employee deleted successfully');
    } catch (error) {
        return res.status(500).send('Internal server error: ' + error.message);
    }
};
module.exports = { createEmployee, getEmployeeById, getAllEmployees, updateEmployee, deleteEmployee };
