const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const authRouter = require('./routes/authRouter');
const attendanceRouter = require('./routes/attendanceRouter');
const employeeRouter = require('./routes/employeeRouter');

const prisma = new PrismaClient();
const app = express();

const corsOptions = {
  origin: 'https://qubinest-frontend.vercel.app',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/qubinest', authRouter);
app.use('/qubinest', attendanceRouter);
app.use('/qubinest', employeeRouter);

app.get('/', (req, res) => {
  res.send("API is working fine");
});

app.get('/test', (req, res) => {
  res.send("API is working fine, this is a test");
});

// Export the app for serverless functionality
module.exports = app;
