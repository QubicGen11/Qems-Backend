const express=require('express')
const authUser=require('../controllers/userAuthController')
const router=express.Router()

router.post('/authUser',authUser)
module.exports=router