const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const employeeLeaveStatus=async(req,res)=>{
    const {employeeEmail}=req.body
    try {
        const isEmployee=await prisma.employee.findFirst({
            where:{
                companyEmail:employeeEmail
            }
        })
        if(!isEmployee){
            return res.status(400).send('employee data not available')
        }
        const isLeaveApproved=await prisma.leaveRequests.findFirst({
            where:{
                employee_id:isEmployee.employee_id,
                status:'Approved'
            }
        })
         
    } catch (error) {
        
    }
}