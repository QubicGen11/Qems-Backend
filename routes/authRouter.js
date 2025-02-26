const express = require('express');
const {
    registerUser, 
    loginUser,
    logoutUser, 
    getAllUsers,
    changePassword,
    verifyOTP,
    resendOTP,
    updateUserStatus,
    forgotPassword,
    verifyForgotPasswordOTP,
    refreshTokenHandler,
    updateUserMainPosition,
    updateMultipleUsersMainPosition,
    
    refreshToken
} = require('../controllers/authController');


const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
// router.post('/refreshtoken', refreshToken);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put('/changepassword', changePassword);
router.get('/allusers', getAllUsers);
router.put("/users/update-main-position", updateUserMainPosition); // Update a specific user's main position
router.put("/users/update-multiple-main-positions", updateMultipleUsersMainPosition); // Update multiple users

router.put('/updateUserStatus', updateUserStatus);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTP);
module.exports = router;