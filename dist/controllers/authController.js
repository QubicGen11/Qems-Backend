'use strict';

var _this = this;

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var nodemailer = require('nodemailer');
var jwtSecret = process.env.jwtSecret;

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'qubicgen@gmail.com',
    pass: 'krst npyz vhhk edtc' // App password
  }
});

var registerUser = function registerUser(req, res) {
  var _req$body, username, email, password, role, salary, mainPosition, joiningDate, hashedPassword, existingUser, newUser, mailOptions;

  return regeneratorRuntime.async(function registerUser$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        _req$body = req.body;
        username = _req$body.username;
        email = _req$body.email;
        password = _req$body.password;
        role = _req$body.role;
        salary = _req$body.salary;
        mainPosition = _req$body.mainPosition;
        joiningDate = _req$body.joiningDate;
        context$1$0.next = 11;
        return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

      case 11:
        hashedPassword = context$1$0.sent;
        context$1$0.next = 14;
        return regeneratorRuntime.awrap(prisma.user.findFirst({
          where: {
            email: email
          }
        }));

      case 14:
        existingUser = context$1$0.sent;

        if (!existingUser) {
          context$1$0.next = 17;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'User already exists' }));

      case 17:
        context$1$0.next = 19;
        return regeneratorRuntime.awrap(prisma.user.create({
          data: {
            username: username,
            email: email,
            password: hashedPassword,
            role: role,
            salary: salary, // Add salary
            mainPosition: mainPosition, // Add main position
            joiningDate: new Date(joiningDate) // Add joining date and ensure it's a Date object
          }
        }));

      case 19:
        newUser = context$1$0.sent;
        mailOptions = {
          from: 'qubicgen@gmail.com',
          to: email,
          subject: 'Welcome to QubiNest - Registration Successful',
          html: '\n        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n          <div style="background-color: #f8f8f8; padding: 20px;">\n            <img src="https://res.cloudinary.com/defsu5bfc/image/upload/v1715348582/og_6_jqnrvf.png" \n                 alt="QubiNest Logo" \n                 style="width: 150px; display: block; margin: 0 auto 20px;">\n            \n            <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to QubiNest!</h1>\n            \n            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">\n              <h2 style="color: #666;">Hello ' + username + ',</h2>\n              <p>Thank you for registering with QubiNest. Your account has been successfully created.</p>\n              \n              <h3 style="color: #333; margin-top: 20px;">Your Account Details:</h3>\n              <p><strong>Username:</strong> ' + username + '</p>\n              <p><strong>Password:</strong> ' + password + '</p>\n              <p><strong>Email:</strong> ' + email + '</p>\n              <p><strong>Position:</strong> ' + mainPosition + '</p>\n              <p><strong>Role:</strong> ' + role + '</p>\n              <p><strong>Joining Date:</strong> ' + new Date(joiningDate).toLocaleDateString() + '</p>\n            </div>\n            \n            <div style="text-align: center; margin: 30px 0;">\n              <a href="http://localhost:5173" \n                 style="background-color: #fbbf24; color: black; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">\n                Login to Your Account\n              </a>\n            </div>\n            \n            <p style="color: #666; font-size: 14px; text-align: center;">\n              If you have any questions or need assistance, please don\'t hesitate to contact our support team.\n            </p>\n          </div>\n          \n          <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">\n            <p>This is an automated message, please do not reply to this email.</p>\n            <p>© ' + new Date().getFullYear() + ' QubiNest. All rights reserved.</p>\n          </div>\n        </div>\n      '
        };
        context$1$0.next = 23;
        return regeneratorRuntime.awrap(transporter.sendMail(mailOptions));

      case 23:

        res.status(201).json({
          success: true,
          message: 'Registration successful. Please check your email.',
          user: {
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
          }
        });

        context$1$0.next = 30;
        break;

      case 26:
        context$1$0.prev = 26;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Error registering user:', context$1$0.t0);
        res.status(500).json({
          success: false,
          message: context$1$0.t0.code === 'P2002' ? 'Email already exists' : 'Registration failed'
        });

      case 30:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 26]]);
};

var loginUser = function loginUser(req, res) {
  var _req$body2, email, password, user, isMatch;

  return regeneratorRuntime.async(function loginUser$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        _req$body2 = req.body;
        email = _req$body2.email;
        password = _req$body2.password;

        console.log('Login attempt for:', email);

        if (!(!email || !password)) {
          context$1$0.next = 7;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        }));

      case 7:
        context$1$0.next = 9;
        return regeneratorRuntime.awrap(prisma.user.findUnique({
          where: { email: email },
          select: {
            email: true,
            password: true,
            role: true,
            status: true
          }
        }));

      case 9:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 12;
          break;
        }

        return context$1$0.abrupt('return', res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        }));

      case 12:
        context$1$0.next = 14;
        return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

      case 14:
        isMatch = context$1$0.sent;

        if (isMatch) {
          context$1$0.next = 17;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Please provide valid username and password'));

      case 17:
        return context$1$0.abrupt('return', res.status(200).json({ message: 'Login successful' }));

      case 20:
        context$1$0.prev = 20;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Login error:', {
          message: context$1$0.t0.message,
          stack: context$1$0.t0.stack
        });

        return context$1$0.abrupt('return', res.status(500).json({
          status: 'error',
          message: 'Internal server error during login'
        }));

      case 24:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 20]]);
};

var logoutUser = function logoutUser(req, res) {
  return regeneratorRuntime.async(function logoutUser$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;

        // Clear the token cookie by setting an expired date
        res.cookie('token', '', {
          httpOnly: true,
          expires: new Date(0)
        });

        // Send a success response
        return context$1$0.abrupt('return', res.status(200).json({ message: 'Logout successful' }));

      case 5:
        context$1$0.prev = 5;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Error logging out user:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).send('Server error'));

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 5]]);
};

var resetPassword = function resetPassword(req, res) {
  var _req$body3, password, confirmPassword, email, user, hashedPassword;

  return regeneratorRuntime.async(function resetPassword$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$body3 = req.body;
        password = _req$body3.password;
        confirmPassword = _req$body3.confirmPassword;
        email = _req$body3.email;

        if (!(password !== confirmPassword)) {
          context$1$0.next = 6;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Passwords do not match'));

      case 6:
        context$1$0.prev = 6;
        context$1$0.next = 9;
        return regeneratorRuntime.awrap(prisma.user.findFirst({
          where: {
            email: email
          }
        }));

      case 9:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 12;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('User not found'));

      case 12:
        context$1$0.next = 14;
        return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

      case 14:
        hashedPassword = context$1$0.sent;
        context$1$0.next = 17;
        return regeneratorRuntime.awrap(prisma.user.update({
          where: { email: email },
          data: { password: hashedPassword }
        }));

      case 17:
        return context$1$0.abrupt('return', res.status(200).json({ message: 'Password reset successful' }));

      case 20:
        context$1$0.prev = 20;
        context$1$0.t0 = context$1$0['catch'](6);

        console.error('Error resetting password:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).send('Server error'));

      case 24:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[6, 20]]);
};

var changePassword = function changePassword(req, res) {
  var _req$body4, email, currentPassword, newPassword, user, isCurrentPassword, hashedNewPassword;

  return regeneratorRuntime.async(function changePassword$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$body4 = req.body;
        email = _req$body4.email;
        currentPassword = _req$body4.currentPassword;
        newPassword = _req$body4.newPassword;
        context$1$0.prev = 4;
        context$1$0.next = 7;
        return regeneratorRuntime.awrap(prisma.user.findFirst({
          where: {
            email: email
          }
        }));

      case 7:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 10;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('User not found'));

      case 10:
        context$1$0.next = 12;
        return regeneratorRuntime.awrap(bcrypt.compare(currentPassword, user.password));

      case 12:
        isCurrentPassword = context$1$0.sent;

        if (isCurrentPassword) {
          context$1$0.next = 15;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Incorrect current password'));

      case 15:
        context$1$0.next = 17;
        return regeneratorRuntime.awrap(bcrypt.hash(newPassword, 10));

      case 17:
        hashedNewPassword = context$1$0.sent;
        context$1$0.next = 20;
        return regeneratorRuntime.awrap(prisma.user.update({
          where: {
            email: email
          },
          data: {
            password: hashedNewPassword
          }
        }));

      case 20:
        return context$1$0.abrupt('return', res.status(200).send('Password updated successfully'));

      case 23:
        context$1$0.prev = 23;
        context$1$0.t0 = context$1$0['catch'](4);
        return context$1$0.abrupt('return', res.status(500).send('Internal server error: ' + context$1$0.t0.message));

      case 26:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[4, 23]]);
};
var getAllUsers = function getAllUsers(req, res) {
  var allUsers;
  return regeneratorRuntime.async(function getAllUsers$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.next = 3;
        return regeneratorRuntime.awrap(prisma.user.findMany({}));

      case 3:
        allUsers = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).send(allUsers));

      case 7:
        context$1$0.prev = 7;
        context$1$0.t0 = context$1$0['catch'](0);
        return context$1$0.abrupt('return', res.status(500).send('internal error' + context$1$0.t0.message));

      case 10:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 7]]);
};
module.exports = { registerUser: registerUser, loginUser: loginUser, logoutUser: logoutUser, resetPassword: resetPassword, getAllUsers: getAllUsers, changePassword: changePassword };

// Email template

// Send welcome email

// Compare the provided password with the stored hashed password

// If password matches, generate a JWT token
// const jwtToken = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
//   expiresIn: '2h',
// });

// // Set the token as a cookie in the response
// res.cookie('token', jwtToken, { httpOnly: true });