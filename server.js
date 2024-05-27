const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv=require('dotenv')
dotenv.config()
const authRouter=require('./routes/authRouter')
const cors=require('cors')

// @initializing prisma and express app
const prisma = new PrismaClient();
const app = express();

//@middlewares
app.use(cors())
app.use(express.json())
app.use('/qubinest',authRouter)



// @prisma config
async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
const PORT = process.env.PORT || 3001;

// @starting app
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
