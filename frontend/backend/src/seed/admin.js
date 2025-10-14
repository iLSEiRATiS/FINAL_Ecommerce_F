require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const name = process.env.ADMIN_NAME || 'Admin';
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.error('Faltan ADMIN_EMAIL y ADMIN_PASSWORD en variables de entorno');
      process.exit(1);
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { name, email, password: hashed, role: 'admin' },
      { upsert: true, new: true }
    );
    console.log('Admin listo:', { id: user.id, email: user.email });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
