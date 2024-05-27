const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userClockin = async (req, res) => {
    try {
        const creds = req.cookies && req.cookies.email; 
        if (!creds) {
            return res.status(400).send('User is not authenticated');
        }
        const user = await prisma.user.findFirst({
            where: {
                email: creds
            }
        });
        if (!user) {
            return res.status(400).send('User not found');
        }
        // Update or create attendance record
        const attendanceRecord = await prisma.attendance.upsert({
            where: {
                employee_id: user.id,
                date: new Date().toISOString().slice(0, 10) // Get current date in YYYY-MM-DD format
            },
            update: {
                checkin_Time: new Date(), // Set the check-in time to the current time
                status: 'Present' // Update the status
            },
            create: {
                employee_id: user.id,
                date: new Date().toISOString().slice(0, 10), // Set the date to the current date
                checkin_Time: new Date(), // Set the check-in time to the current time
                status: 'Present' // Set the status to 'Present'
            }
        });

        return res.status(200).json({ message: 'Clock in successful', attendanceRecord });
    } catch (error) {
        console.error('Error clocking in user:', error);
        return res.status(500).send('Internal server error');
    }
}
const userClockout = async (req, res) => {
    try {
        const { creds } = req.cookies.email;

        if (!creds) {
            return res.status(400).send('User is not authenticated');
        }

        const user = await prisma.user.findFirst({
            where: {
                email: creds
            }
        });

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

        if (!latestAttendanceRecord) {
            return res.status(400).send('No attendance record found for the user');
        }

        // Update the latest attendance record with checkout time
        const updatedAttendanceRecord = await prisma.attendance.update({
            where: {
                attendance_id: latestAttendanceRecord.attendance_id
            },
            data: {
                checkout_Time: new Date(), // Set the checkout time to the current time
                status: 'Checked Out' // Update the status
            }
        });

        return res.status(200).json({ message: 'Clock out successful', updatedAttendanceRecord });
    } catch (error) {
        console.error('Error clocking out user:', error);
        return res.status(500).send('Internal server error');
    }
}
module.exports = { userClockin,userClockout };
