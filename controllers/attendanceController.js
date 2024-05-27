const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;

const userClockin = async (req, res) => {
    try {
        const { email } = req.body;
        // Find the user based on the provided email
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email
                }
            }
        });

        // If user not found, return error response
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Format the current date in ISO-8601 format
        const currentDate = new Date().toISOString(); // Changed to include time as well

        // Create a new attendance record for the user
        const attendanceRecord = await prisma.attendance.create({
            data: {
                employee_id: user.id,
                date: currentDate, // Use the formatted current date
                checkin_Time: new Date(),
                status: 'Present'
            }
        });

        // Return success response with the created attendance record
        return res.status(200).json({ message: 'Clock in successful', attendanceRecord });
    } catch (error) {
        console.error('Error clocking in user:', error);
        return res.status(500).send('Internal server error');
    }
};

const userClockout = async (req, res) => {
    try {
        const { email } = req.body; // Destructure email from the request body
        // Find the user based on the provided email
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email // Use 'equals' to match the email
                }
            }
        });

        // If user not found, return error response
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Find the latest attendance record for the user
        const latestAttendanceRecord = await prisma.attendance.findFirst({
            where: {
                employee_id: user.id
            },
            orderBy: {
                date: 'desc'
            }
        });

        // If no attendance record found, return error response
        if (!latestAttendanceRecord) {
            return res.status(400).send('No attendance record found for the user');
        }

        // Update the latest attendance record with checkout time and status
        const updatedAttendanceRecord = await prisma.attendance.update({
            where: {
                attendance_id: latestAttendanceRecord.attendance_id
            },
            data: {
                checkout_Time: new Date(), // Set the checkout time to the current time
                status: 'Checked Out' // Update the status
            }
        });

        // Return success response with the updated attendance record
        return res.status(200).json({ message: 'Clock out successful', updatedAttendanceRecord });
    } catch (error) {
        console.error('Error clocking out user:', error);
        return res.status(500).send('Internal server error');
    }
};

module.exports = { userClockin, userClockout };
