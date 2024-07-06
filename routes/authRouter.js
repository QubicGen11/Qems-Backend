const express=require('express')
const {registerUser, loginUser,logoutUser,getAllUsers,changePassword} = require('../controllers/authController')

const router=express.Router()
router.post('/register',registerUser)
router.put('/changepassword',changePassword)
router.post('/login',loginUser)
router.post('/logout',logoutUser)
router.get('/allusers',getAllUsers)
module.exports=router