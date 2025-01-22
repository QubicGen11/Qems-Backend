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
    pass: 'bxpn shmj rhww susz'  // App password
  }
});

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      role, 
      salary, 
      mainPosition, 
      joiningDate, 
      department,
      subDepartment
    } = req.body;

    console.log('Received registration data:', {
      username,
      email,
      role,
      salary,
      mainPosition,
      joiningDate,
      department,
      subDepartment
    });

    // Validation checks
    if (!username || !email || !password || !role || !salary || !mainPosition || !joiningDate || !department) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        missingFields: {
          username: !username,
          email: !email,
          password: !password,
          role: !role,
          salary: !salary,
          mainPosition: !mainPosition,
          joiningDate: !joiningDate,
          department: !department
        }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@qubicgen\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format. Email must be from @qubicgen.com domain' 
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing OTP for this email
    await prisma.oTP.deleteMany({
      where: { email }
    });

    // Store registration data along with OTP
    await prisma.oTP.create({
      data: {
        email,
        otp,
        expiresAt: otpExpiry,
        metadata: JSON.stringify({
          username,
          password,
          role,
          salary,
          mainPosition,
          joiningDate,
          department,
          subDepartment
        })
      }
    });

    // Send OTP email
    const mailOptions = {
      from: 'qubicgen@gmail.com',
      to: email,
      subject: 'QubiNest - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your OTP for email verification is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for verification'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find the OTP record
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        otp,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Parse the stored registration data
    const registrationData = otpRecord.metadata ? JSON.parse(otpRecord.metadata) : null;

    if (!registrationData) {
      return res.status(400).json({
        success: false,
        message: 'Registration data not found'
      });
    }

    // Create the user with subDepartment
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    const newUser = await prisma.user.create({
      data: {
        username: registrationData.username,
        email: email,
        password: hashedPassword,
        role: registrationData.role,
        salary: parseFloat(registrationData.salary),
        mainPosition: registrationData.mainPosition,
        department: registrationData.department,
        subDepartment: registrationData.subDepartment,
        joiningDate: new Date(registrationData.joiningDate),
        status: 'Active'
      }
    });

    // Delete the OTP record
    await prisma.oTP.delete({
      where: {
        email: email
      }
    });

    // Send confirmation email
    const confirmationMailOptions = {
      from: 'qubicgen@gmail.com',
      to: email,
      subject: 'QubiNest - Registration Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to QubiNest!</h2>
          <p>Dear ${newUser.username},</p>
          <p>Your registration was successful. You can now log in using your credentials.</p>
          <p>Thank you for joining us!</p>
        </div>
      `
    };

    await transporter.sendMail(confirmationMailOptions);

    return res.status(200).json({
      success: true,
      message: 'Email verified and registration completed successfully',
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

const resendOTP = async (req, res) => {
  // Implementation for resending OTP
  // Similar to the OTP generation part in registerUser
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
        status: true,
        department: true,
        username: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({
        status: 'error',
        message: 'Account is disabled. Please contact admin.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Please provide valid username and password');
    }

    return res.status(200).json({ 
      message: 'Login successful',
      user: {
        email: user.email,
        role: user.role,
        department: user.department,
        username: user.username,
        status: user.status
      }
    });

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

const updateUserStatus = async (req, res) => {
  const { email, status } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.update({
      where: { email },
      data: { status }
    });

    return res.status(200).json({ message: `User status updated to ${status}` });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { registerUser, loginUser, logoutUser, resetPassword, getAllUsers, changePassword, verifyOTP, resendOTP, updateUserStatus };
