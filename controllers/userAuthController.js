const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authorizeUser = async (req, res) => {
    const { userEmail } = req.body;

    if (!userEmail) {
        return res.status(400).send('Email is required');
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: userEmail,
            },
        });

        if (!user) {
            return res.status(400).send('User not found or not authorized');
        }

        return res.status(200).json({ role: user.role });
    } catch (error) {
        console.error('Internal server error:', error); // Logging error
        return res.status(500).send('Internal server error: ' + error.message);
    }
};

module.exports = authorizeUser;
