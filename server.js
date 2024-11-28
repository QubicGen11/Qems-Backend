const express = require('express');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const pdf = require('html-pdf');
const fs = require('fs');
const authRouter = require('./routes/authRouter');
const userAuthRouter = require('./routes/userAuthRoute');
const attendanceRoute = require('./routes/attendanceRouter');
const employeeRouter = require('./routes/employeeRouter');
const reportRouter = require('./routes/reportRouter');
const authenticateToken = require('./middlewares/authenticateUser');
const leaveRequestRouter=require('./routes/leaveRequestRouter')
const teamRouter=require('./routes/teamRouter')
const documentRouter = require('./routes/documentRouter');
const bankDetailsRouter = require('./routes/bankDetailsRouter'); 
const notificationRoutes = require('./routes/notificationRoutes');
const bodyParser = require('body-parser');

dotenv.config();

// Initialize Prisma with correct options
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'minimal',
});

const app = express();

// Add session middleware BEFORE other middleware and routes
app.use(session({
  secret: 'your-secret-key', // Change this to a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000 // 15 minutes
  }
}));

// Error handling for Prisma
prisma.$on('error', (e) => {
  console.error('Prisma Error:', e);
});

// Middleware setup
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8085', 'https://qems.qubinest.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/qubinest', authRouter);
app.use('/qubinest', userAuthRouter);
app.use('/qubinest', attendanceRoute);
app.use('/qubinest', employeeRouter);
app.use('/qubinest', reportRouter);
app.use('/qubinest', leaveRequestRouter);
app.use('/qubinest', teamRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/bankdetails', bankDetailsRouter);
app.use('/qubinest', notificationRoutes);
app.use('/documents', documentRouter);

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await prisma.$disconnect();
  process.exit(0);
});

app.set('trust proxy', true);
app.use((req, res, next) => {
  console.log('Request IP:', req.ip);
  console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
  console.log('Remote Address:', req.connection.remoteAddress);
  next();
});
