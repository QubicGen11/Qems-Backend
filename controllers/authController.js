const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, salary, mainPosition, joiningDate } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        role: role,
        salary: salary,  // Add salary
        mainPosition: mainPosition,  // Add main position
        joiningDate: new Date(joiningDate)  // Add joining date and ensure it's a Date object
      }
    });

    res.status(201).json(newUser); // Use 201 for created
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      return res.status(400).send('User data is not present, please register to continue');
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).send('Please provide valid username and password');
    }

    // If password matches, generate a JWT token
    const jwtToken = jwt.sign({ id: existingUser.id, email: existingUser.email }, jwtSecret, {
      expiresIn: '2h',
    });

    // Set the token as a cookie in the response
    res.cookie('token', jwtToken, { httpOnly: true });

    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).send('Server error');
  }
};

const logoutUser = async (req, res) => {
  try {
    // Clear the token cookie by setting an expired date
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    // Send a success response
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error logging out user:', error);
    return res.status(500).send('Server error');
  }
};

const resetPassword = async (req, res) => {
  const { password, confirmPassword, email } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    });

    if (!user) {
      return res.status(400).send('User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).send('Server error');
  }
};

module.exports = { registerUser, loginUser, logoutUser, resetPassword };
