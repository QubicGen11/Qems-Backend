const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const jwtSecret=process.env.jwtSecret
const generateEmployeeId = async () => {
  const prefix = 'QG24';
  const lastEmployee = await prisma.employee.findFirst({
      orderBy: { employee_id: 'desc' },
  });
  let newIdNumber;
  if (lastEmployee) {
      const lastIdNumber = parseInt(lastEmployee.employee_id.slice(prefix.length));
      newIdNumber = lastIdNumber + 1;
  } else {
      newIdNumber = 1;
  }
  return `${prefix}${newIdNumber.toString().padStart(3, '0')}`;
};
const registerUser = async (req, res) => {
  const employee_Id=await generateEmployeeId()
  try {
      const { username, email, password, role } = req.body; // Changed 'position' to 'role'
      const hashedPassword = await bcrypt.hash(password, 10);
      const existingUser = await prisma.user.findFirst({
          where: {
              email: email
          }
      });
      if (existingUser) {
          return res.status(400).send('User already exists');
      }
      const newUser = await prisma.user.create({
          data: {
              username: username,
              email: email,
              password: hashedPassword,
              role: role // Changed 'position' to 'role'
          }
      });
      res.status(200).json(newUser);
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send('Internal server error');
  }
};

const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // @Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });
  
      if (!existingUser) {
        return res.status(400).send('User data is not present, please register to continue');
      }
      // @Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, existingUser.password);
  
      if (!isMatch) {
        return res.status(400).send('Please provide valid username and password');
      }
      //  @If password matches, generate a JWT token
      const jwtToken = jwt.sign({ id: existingUser.id, email: existingUser.email,employeeId:existingUser.employeeId }, jwtSecret, {
        expiresIn: '2h',
      });
      //@Set the token as a cookie in the response
      res.cookie('token', jwtToken, {
        httpOnly: true,
        expiresIn: 2 * 60 * 60 * 1000,  
      });
      res.cookie('email',email)
      return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Server error');
    }
  };


  const logoutUser = async (req, res) => {
    try {
    //   Clear the token cookie by setting an expired date
      res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
      });
    // res.clearcookie('token')
      // Send a success response
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Server error');
    }
  };
module.exports = {registerUser,loginUser,logoutUser} ;
