require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'cotistore';
if (!uri) {
  console.error('Falta MONGODB_URI en .env');
  process.exit(1);
}

const User = require('../src/models/User');

(async () => {
  try {
    const [,, emailArg, newPassArg] = process.argv;
    if (!emailArg || !newPassArg) {
      console.log('Uso: node scripts/reset-password.js <email> <nueva_password>');
      process.exit(1);
    }
    const email = String(emailArg).trim().toLowerCase();
    const newPass = String(newPassArg);

    await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 10000 });

    const user = await User.findOne({ email });
    if (!user) {
      console.error('Usuario no encontrado:', email);
      process.exit(2);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPass, salt);
    await user.save();

    console.log(`OK: contraseña reseteada para ${email}`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(3);
  }
})();
