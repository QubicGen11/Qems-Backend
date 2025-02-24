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
const employeeRoutes = require('./routes/employeeRoutes');
const authRouter = require('./routes/authRouter');
const userAuthRouter = require('./routes/userAuthRoute');
const attendanceRoute = require('./routes/attendanceRouter');
const employeeRouter = require('./routes/employeeRouter');
const reportRouter = require('./routes/reportRouter');
const authenticateToken = require('./middlewares/authenticateUser');
const leaveRequestRouter = require('./routes/leaveRequestRouter');
const teamRouter = require('./routes/teamRouter');
const documentRouter = require('./routes/documentRouter');
const bankDetailsRouter = require('./routes/bankDetailsRouter');
const notificationRoutes = require('./routes/notificationRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const bodyParser = require('body-parser');
const os = require('os');

dotenv.config();

// Initialize Prisma with correct options
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'minimal',
});

const app = express();

// ✅ SESSION Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000, // 15 minutes
  }
}));

// ✅ Error handling for Prisma
prisma.$on('error', (e) => {
  console.error('Prisma Error:', e);
});

// ✅ Middleware setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

// ✅ Define allowed CORS origins
const allowedOrigins = [
  'https://qems.qubinest.com',
  'http://localhost:8085',
  'https://image.qubinest.com'
];

// ✅ Improved CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);  // Dynamically set origin
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
};

// ✅ Apply CORS middleware before all routes
app.use(cors(corsOptions));

// ✅ Ensure OPTIONS preflight requests return correct headers
app.options('*', cors(corsOptions));

// ✅ Global middleware to set headers manually
app.use((req, res, next) => {
  res.removeHeader('Access-Control-Allow-Origin');  // Remove if already set
  res.removeHeader('Access-Control-Allow-Methods');
  res.removeHeader('Access-Control-Allow-Headers');
  res.removeHeader('Access-Control-Allow-Credentials');
  next();
});

// ✅ Routes
app.use('/qubinest', authRouter);
app.use('/qubinest/employees', employeeRoutes);
app.use('/qubinest', userAuthRouter);
app.use('/qubinest', attendanceRoute);
app.use('/qubinest', employeeRouter);
app.use('/qubinest', reportRouter);
app.use('/qubinest', leaveRequestRouter);
app.use('/qubinest', teamRouter);
app.use('/qubinest', suggestionRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/bankdetails', bankDetailsRouter);
app.use('/qubinest', notificationRoutes);
app.use('/documents', documentRouter);
app.use('/qems/cms', authenticateToken, cmsRoutes); // Ensure authentication is applied

// ✅ Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// ✅ Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await prisma.$disconnect();
  process.exit(0);
});
