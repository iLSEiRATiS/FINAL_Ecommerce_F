const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'cotistore';

  if (!uri) throw new Error('Falta MONGODB_URI');
  if (!process.env.JWT_SECRET) {
    console.warn('[WARN] JWT_SECRET no seteado; auth no va a firmar tokens correctamente');
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 10
  });
  const host = conn.connection.host || conn.connection.name || 'unknown';
  console.log(`Mongo conectado → host=${host} db=${dbName}`);
};
