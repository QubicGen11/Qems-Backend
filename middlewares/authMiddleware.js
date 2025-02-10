const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;

exports.verifyUserByEmail = async (req, res, next) => {
  const userEmail = req.headers['email']; // Getting email from request headers

  if (!userEmail) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Fetch user details from the database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        email: true,
        role: true,
        department: true,
        subDepartment: true,
        mainPosition: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Attach user details to the request object
    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Authorization Header:', authHeader);
  console.log('Extracted Token:', token);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded Token:', decoded);
    req.user = decoded; // Attach decoded token data to the request object
    next();
  } catch (error) {
    console.error('Token Verification Error:', error);
    return res.status(400).json({ success: false, message: 'Invalid token.' });
  }
};
