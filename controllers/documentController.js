const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDocument = async (req, res) => {
    const { type, employeeId } = req.params;

    try {
        const employee = await prisma.employee.findUnique({
            where: { employee_id: employeeId },
            include: {
                users: true, // Include related User model
            },
        });

        if (!employee) {
            return res.status(404).send('Employee not found');
        }

        const user = employee.users && employee.users[0]; // Assuming a one-to-one relationship
        if (!user) {
            return res.status(404).send('User not found');
        }

        let template;
        switch (type) {
            case 'offer':
                template = 'offer_letter';
                break;
            case 'joining':
                template = 'joining-letter';
                break;
            case 'experience':
                template = 'experience-letter';
                break;
            case 'hike':
                template = 'hike-letter';
                break;
            case 'payslip':
                template = 'payslips';
                break;
            default:
                return res.status(400).send('No documents found');
        }

        // Combine data from both models
        const data = {
            employee_id: employee.employee_id,
            firstname: employee.firstname,
            lastname: employee.lastname,
            dob: employee.dob,
            gender: employee.gender,
            address: employee.address,
            phone: employee.phone,
            email: employee.email,
            position: employee.position,
            education: employee.education,
            skills: employee.skills,
            linkedin: employee.linkedin,
            about: employee.about,
            companyEmail: employee.companyEmail,
            hireDate: employee.hireDate,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
            joiningDate: user.joiningDate,
            salary: user.salary,
            mainPosition: user.mainPosition
        };

        res.render(template, { employee: data });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).send('Error fetching employee');
    }
};

module.exports = {
    getDocument,
};