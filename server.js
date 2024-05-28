const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();
const authRouter = require('./routes/authRouter');
const attendanceRouter = require('./routes/attendanceRouter');
const employeeRouter = require('./routes/employeeRouter');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initializing Prisma and Express app
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'https://qubinest-frontend.vercel.app',
  // origin: 'http://localhost:3000',
  credentials: true, // This is required to allow credentials (cookies, headers)
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use('/qubinest', authRouter);
app.use('/qubinest', attendanceRouter);
app.use('/qubinest', employeeRouter);
app.use(cookieParser());

// Prisma configuration
async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Starting app
app.get("/", (req, res) => {
  res.send("API is working fine");
});
app.get("/test", (req, res) => {
  res.send("This is a test");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
