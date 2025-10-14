// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB    = require('./src/config/db');
const authRoutes   = require('./src/routes/auth.routes');
const adminRoutes  = require('./src/routes/admin.routes');
const ordersRoutes = require('./src/routes/orders.routes');

const PORT = process.env.PORT || 4000;

process.on('unhandledRejection', (e) => console.error('UNHANDLED REJECTION:', e?.message || e));
process.on('uncaughtException', (e) => console.error('UNCAUGHT EXCEPTION:', e?.message || e));

async function start() {
  try {
    await connectDB();

    const app = express();
    app.set('trust proxy', 1);
    app.use(morgan('tiny'));
    app.use(express.json());

    const allowList = (process.env.CORS_ORIGINS || '')
      .split(',').map(s => s.trim()).filter(Boolean);

    if (allowList.length === 0) {
      allowList.push(
        'http://localhost:3000',
        'http://localhost:5173',
        'https://final-ecommerce-f.onrender.com'
      );
    }

    const corsOptions = {
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (allowList.includes(origin)) return cb(null, true);
        cb(new Error('CORS: origen no permitido: ' + origin));
      },
      methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization'],
      credentials: false,
      optionsSuccessStatus: 204
    };

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions)); // preflight ANTES del 404

    app.get('/', (_req, res) => res.type('text').send('CotiStore API'));
    app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

    app.use('/api/auth', authRoutes);
    app.use('/api/orders', ordersRoutes); // NUEVO
    app.use('/api/admin', adminRoutes);

    app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

    // eslint-disable-next-line no-unused-vars
    app.use((err, _req, res, _next) => {
      console.error('ERROR:', err.message);
      res.status(err.status || 500).json({ error: err.message || 'Internal error' });
    });

    app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
  } catch (e) {
    console.error('Error fatal al iniciar:', e.message);
    process.exit(1);
  }
}

start();
