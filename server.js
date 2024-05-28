const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv=require('dotenv')
dotenv.config()
const authRouter=require('./routes/authRouter')
const attendanceRouter=require('./routes/attendanceRouter')
const employeeRouter=require('./routes/employeeRouter')
const cors=require('cors')
const cookieParser=require('cookie-parser')
// @initializing prisma and express app
const prisma = new PrismaClient();
const app = express();
const corsOptions = {
  origin:' http://localhost:5173',
  // origin:' https://qubinest-frontend.vercel.app',
  credentials: true, // This is required to allow credentials (cookies, headers)
};
//@middlewares
app.use(cors(corsOptions))
app.use(express.json())
app.use('/qubinest',authRouter)
app.use('/qubinest',attendanceRouter)
app.use('/qubinest',employeeRouter)
app.use(cookieParser())

// @prisma config
async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
const PORT = process.env.PORT ;


app.get('/',(req,res)=>{
res.send("Api is working fine")
})
// @starting app
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
