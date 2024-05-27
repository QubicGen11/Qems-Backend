const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt=require('bcrypt')
const registerUser = async (req, res) => {
    try {
        const { username, email, password, position } = req.body;
        const hashedPassword=await bcrypt.hash(password,10)
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email
            }
        });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
        const newUser = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword,
                position: position
            }
        });
        res.status(200).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = registerUser ;
