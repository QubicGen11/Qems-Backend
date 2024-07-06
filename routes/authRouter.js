const express=require('express')
const {registerUser, loginUser,logoutUser,getAllUsers} = require('../controllers/authController')

const router=express.Router()
router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/logout',logoutUser)
router.get('/allusers',getAllUsers)
module.exports=router