// backend/scripts/make-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

(async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.error('Uso: node scripts/make-admin.js email@dominio');
      process.exit(1);
    }

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'cotistore';
    if (!uri) throw new Error('Falta MONGODB_URI en .env');

    await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 10000 });

    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) {
      console.error('Usuario no encontrado:', email);
      process.exit(2);
    }

    console.log('OK:', user.email, 'ahora es', user.role);
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
