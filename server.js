const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const pdf = require('html-pdf');
const fs = require('fs');
const authRouter = require('./routes/authRouter');
const attendanceRoute = require('./routes/attendanceRouter');
const employeeRouter = require('./routes/employeeRouter');
const reportRouter = require('./routes/reportRouter');
const authenticateToken = require('./middlewares/authenticateUser');

dotenv.config();

// @initializing prisma and express app
const prisma = new PrismaClient();
const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true, // This is required to allow credentials (cookies, headers)
};

// @middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use('/qubinest', authRouter);
app.use('/qubinest', attendanceRoute);
app.use('/qubinest', employeeRouter);
app.use(morgan('dev'));
app.use(cookieParser());
app.use('/qubinest', reportRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dynamic route to render the requested document with employee data
app.get('/documents/:type/:employeeId', async (req, res) => {
    const { type, employeeId } = req.params;

    try {
        const employee = await prisma.employee.findUnique({
            where: { employee_id: employeeId },
        });

        if (!employee) {
            return res.status(404).send('Employee not found');
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
            default:
                return res.status(400).send('Invalid document type');
        }

        res.render(template, { employee });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).send('Error fetching employee');
    }
});


// @prisma config
async function shutdown() {
    await prisma.$disconnect();
    process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
const PORT = process.env.PORT || 3000;

// @starting app
app.get("/", (req, res) => {
    res.send("API is working fine");
});

app.get("/test", (req, res) => {
    res.send("This is a test");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
