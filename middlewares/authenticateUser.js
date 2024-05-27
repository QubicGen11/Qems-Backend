const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;
const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send('User is not authenticated');
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded; // Add decoded user info to request
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).send('Invalid token');
    }
  };
module.exports=authenticateUser