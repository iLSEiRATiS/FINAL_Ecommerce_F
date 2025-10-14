const { Router } = require('express');
const User = require('../models/User');
const Order = require('../models/Order');

let auth = require('../middlewares/auth');
let admin = require('../middlewares/admin');
if (typeof auth !== 'function' && auth && typeof auth.auth === 'function') auth = auth.auth;
if (typeof admin !== 'function' && admin && typeof admin.admin === 'function') admin = admin.admin;

const router = Router();

// Lista de usuarios
router.get('/users', auth, admin, async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// Eliminar usuario (protección: no te dejás borrar a vos mismo)
router.delete('/users/:id', auth, admin, async (req, res) => {
  const targetId = req.params.id;
  if (!targetId) return res.status(400).json({ error: 'Falta id' });
  if (String(targetId) === String(req.userId)) {
    return res.status(400).json({ error: 'No podés borrarte a vos mismo' });
  }

  // También borramos pedidos del usuario para no dejar basura referenciada
  const user = await User.findById(targetId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  await Order.deleteMany({ user: user._id });
  await user.deleteOne();

  res.json({ ok: true });
});

// Listado global de pedidos (admin)
router.get('/orders', auth, admin, async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(1000);
  res.json(orders);
});

module.exports = router;
