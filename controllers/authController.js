const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');
const jwtSecret = process.env.jwtSecret;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'qubicgen@gmail.com',
    pass: 'krst npyz vhhk edtc'  // App password
  }
});


const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, salary, mainPosition, joiningDate, department } = req.body;
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
        username,
        email,
        password: hashedPassword,
        role,
        salary: parseFloat(salary),
        mainPosition,
        department,
        joiningDate: new Date(joiningDate)
      }
    });

    // Email template
    const mailOptions = {
      from: 'qubicgen@gmail.com',
      to: email,
      subject: 'Welcome to QubiNest - Registration Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f8f8; padding: 20px;">
            <img src="https://res.cloudinary.com/defsu5bfc/image/upload/v1715348582/og_6_jqnrvf.png" 
                 alt="QubiNest Logo" 
                 style="width: 150px; display: block; margin: 0 auto 20px;">
            
            <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to QubiNest!</h1>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #666;">Hello ${username},</h2>
              <p>Thank you for registering with QubiNest. Your account has been successfully created.</p>
              
              <h3 style="color: #333; margin-top: 20px;">Your Account Details:</h3>
              <p><strong>Username:</strong> ${username}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Position:</strong> ${mainPosition}</p>
              <p><strong>Department:</strong> ${department}</p>
              <p><strong>Role:</strong> ${role}</p>
              <p><strong>Joining Date:</strong> ${new Date(joiningDate).toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173" 
                 style="background-color: #fbbf24; color: black; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Login to Your Account
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} QubiNest. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // Send welcome email
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email.',
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      success: false,
      message: error.code === 'P2002' ? 'Email already exists' : 'Registration failed'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        password: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Please provide valid username and password');
    }

    // If password matches, generate a JWT token
    // const jwtToken = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
    //   expiresIn: '2h',
    // });

    // // Set the token as a cookie in the response
    // res.cookie('token', jwtToken, { httpOnly: true });

    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during login'
    });
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

const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    });
    
    if (!user) {
      return res.status(400).send('User not found');
    }
    
    const isCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPassword) {
      return res.status(400).send('Incorrect current password');
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: {
        email: email
      },
      data: {
        password: hashedNewPassword
      }
    });
    
    return res.status(200).send('Password updated successfully');
    
  } catch (error) {
    return res.status(500).send('Internal server error: ' + error.message);
  }
};
const getAllUsers=async(req,res)=>{
  try {
    const allUsers=await prisma.user.findMany({})
    return res.status(200).send(allUsers)
  } catch (error) {
    return res.status(500).send('internal error'+error.message)

  }
}
module.exports = { registerUser, loginUser, logoutUser, resetPassword,getAllUsers,changePassword };
