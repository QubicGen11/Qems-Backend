const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.jwtSecret || "your_secret_key"; // Use the same key for signing & verifying


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
    const emailRegex = /^[^\s@]+@(qubicgen\.com|gmail\.com)$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
      message: 'Invalid email format. Email must be from @qubicgen.com or @gmail.com domain' 
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
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if there's an existing OTP record
    const existingOTP = await prisma.oTP.findUnique({
      where: { email }
    });

    if (!existingOTP) {
      return res.status(404).json({
        success: false,
        message: 'No registration in progress for this email'
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    const newOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update the OTP record
    await prisma.oTP.update({
      where: { email },
      data: {
        otp: newOTP,
        expiresAt: newOTPExpiry,
        // Keep the existing metadata
        metadata: existingOTP.metadata
      }
    });

    // Send new OTP email
    const mailOptions = {
      from: 'qubicgen@gmail.com',
      to: email,
      subject: 'QubiNest - New Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification - New OTP</h2>
          <p>Your new OTP for email verification is: <strong>${newOTP}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
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
        status: true,
        department: true,
        subDepartment: true,
        mainPosition: true, // Added mainPosition
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

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        department: user.department,
        subDepartment: user.subDepartment,
        mainPosition: user.mainPosition, // Added mainPosition
        username: user.username,
        status: user.status
      },
      jwtSecret,
      { expiresIn: '10h' }
    );

    console.log('Generated Token:', token);

    return res.status(200).json({ 
      message: 'Login successful',
      token, // Return the token
      user: {
        email: user.email,
        role: user.role,
        department: user.department,
        subDepartment: user.subDepartment,
        mainPosition: user.mainPosition, // Added mainPosition
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

const updateUserMainPosition = async (req, res) => {
  try {
      // 🔹 Extract token from headers
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
          return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
      }

      // 🔹 Verify token
      const decoded = jwt.verify(token, SECRET_KEY);
      
      // 🔹 Check if the user is an Admin
      if (decoded.role !== "Admin") {
          return res.status(403).json({ success: false, message: "Forbidden: Only Admins can update main position" });
      }

      // 🔹 Get email & new position from request body
      const { email, newMainPosition } = req.body;
      
      // 🔹 Update the user's mainPosition
      const updatedUser = await prisma.user.update({
          where: { email: email }, 
          data: { mainPosition: newMainPosition },
      });

      return res.status(200).json({ success: true, message: "User mainPosition updated successfully", user: updatedUser });
  } catch (error) {
      return res.status(500).json({ success: false, message: "Internal error: " + error.message });
  }
};

const updateMultipleUsersMainPosition = async (req, res) => {
  try {
      const { employeeIds, newMainPosition } = req.body; // Accept employee IDs array

      const updatedUsers = await prisma.user.updateMany({
          where: {
              employeeId: { in: employeeIds }, // Update all users matching these IDs
          },
          data: { mainPosition: newMainPosition },
      });

      return res.status(200).json({ success: true, message: "Users' mainPosition updated successfully", updatedCount: updatedUsers.count });
  } catch (error) {
      return res.status(500).json({ success: false, message: "Internal error: " + error.message });
  }
};


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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing OTP for this email
    await prisma.oTP.deleteMany({
      where: { email }
    });

    // Store the OTP
    await prisma.oTP.create({
      data: {
        email,
        otp,
        expiresAt: otpExpiry,
        metadata: JSON.stringify({
          action: 'password_reset'
        })
      }
    });

    // Send OTP email
    const mailOptions = {
      from: 'qubicgen@gmail.com',
      to: email,
      subject: 'QubiNest - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Your OTP for password reset is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for password reset'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message
    });
  }
};

const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
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

    // Parse the stored metadata
    const metadata = otpRecord.metadata ? JSON.parse(otpRecord.metadata) : null;

    if (!metadata || metadata.action !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP action'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Delete the OTP record
    await prisma.oTP.delete({
      where: { email }
    });

    // Send confirmation email
    const confirmationMailOptions = {
      from: 'qubicgen@gmail.com',
      to: email,
      subject: 'QubiNest - Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Successful</h2>
          <p>Your password has been successfully reset.</p>
          <p>If you did not request this change, please contact support immediately.</p>
        </div>
      `
    };

    await transporter.sendMail(confirmationMailOptions);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP and reset password',
      error: error.message
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, resetPassword, getAllUsers, changePassword, verifyOTP, resendOTP, updateUserStatus, forgotPassword, verifyForgotPasswordOTP , updateUserMainPosition , updateMultipleUsersMainPosition };
