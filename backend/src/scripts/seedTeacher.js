require('dotenv').config();
const mongoose = require('mongoose');
const { Teacher } = require('../models');
const { hashPassword } = require('../utils/password');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const passwordHash = await hashPassword('ChangeMe123!');
  const teacher = await Teacher.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@mathea.tn',
    passwordHash,
    role: 'admin',
  });
  console.log('Seeded teacher:', teacher.email);
  process.exit(0);
})();