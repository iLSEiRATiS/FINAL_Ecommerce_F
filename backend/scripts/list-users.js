// backend/scripts/list-users.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'cotistore';
    if (!uri) throw new Error('Falta MONGODB_URI en .env');

    await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 10000 });

    // Cargar el modelo User sin romper lo existente
    let User;
    try {
      User = require('../src/models/User');
    } catch {
      // fallback genérico por si el path del modelo difiere
      const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
      User = mongoose.model('User', userSchema);
    }

    // Parámetros CLI:
    //   node scripts/list-users.js [emailSubstring] [role]
    const emailSub = (process.argv[2] || '').trim();
    const role = (process.argv[3] || '').trim();

    const filter = {};
    if (emailSub) filter.email = { $regex: emailSub, $options: 'i' };
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    if (!users.length) {
      console.log('Sin resultados.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Salida prolija
    for (const u of users) {
      const created = u.createdAt ? new Date(u.createdAt).toISOString() : '—';
      const updated = u.updatedAt ? new Date(u.updatedAt).toISOString() : '—';
      console.log(
        `• ${u.name || '—'} <${u.email}> | role=${u.role || 'user'} | ` +
        `created=${created} | updated=${updated} | _id=${u._id}`
      );
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
