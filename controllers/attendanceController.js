const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;
const userClockin=async()=>{
    try {
        
    } catch (error) {
        
    }
} 
const userClockout=async()=>{
    try {
        
    } catch (error) {
        
    }
} 
module.exports={userClockin,userClockout}