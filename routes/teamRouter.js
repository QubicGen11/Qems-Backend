const express=require('express')
const{createTeam,addEmployeeToTeam,appointTeamLead,getAllTeams}=require('../controllers/teamController')
const router=express.Router()
router.post('/createTeam',createTeam)
router.post('/addEmployeeToTeam',addEmployeeToTeam)
router.post('/appointTeamLead',appointTeamLead)
router.get('/allTeams',getAllTeams)
 
module.exports=router