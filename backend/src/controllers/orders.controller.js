const Order = require('../models/Order');

// Recalcula totales del lado servidor, porque confiar ciegamente en el cliente es una invitación al caos.
function computeTotals(items = []) {
  const normalized = (items || []).map(it => {
    const qty   = Math.max(1, Number(it.qty || 0));
    const price = Math.max(0, Number(it.price || 0));
    const subtotal = +(qty * price).toFixed(2);
    return {
      productId: String(it.productId || '').trim() || undefined,
      name: String(it.name || '').trim(),
      price, qty, subtotal
    };
  }).filter(it => it.name && it.qty > 0);

  const itemsCount = normalized.reduce((acc, it) => acc + it.qty, 0);
  const amount     = normalized.reduce((acc, it) => acc + it.subtotal, 0);
  return { items: normalized, totals: { items: itemsCount, amount: +amount.toFixed(2) } };
}

exports.create = async (req, res) => {
  try {
    const { items, shipping, payment } = req.body || {};
    const computed = computeTotals(items);
    if (!computed.items.length) return res.status(400).json({ error: 'Carrito vacío' });

    const order = await Order.create({
      user: req.userId,
      items: computed.items,
      totals: computed.totals,
      shipping: shipping || {},
      payment: payment || { method: 'manual' },
      status: 'created'
    });

    return res.status(201).json({ order });
  } catch (e) {
    console.error('orders.create:', e);
    return res.status(500).json({ error: 'No se pudo crear el pedido' });
  }
};

exports.mine = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (e) {
    console.error('orders.mine:', e);
    return res.status(500).json({ error: 'No se pudieron obtener los pedidos' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    const isOwner = String(order.user) === String(req.userId);
    const isAdmin = req.userRole === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Sin permiso' });
    return res.json({ order });
  } catch (e) {
    console.error('orders.getById:', e);
    return res.status(500).json({ error: 'Error' });
  }
};

// Admin
exports.listAll = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(1000);
    return res.json({ orders });
  } catch (e) {
    console.error('orders.listAll:', e);
    return res.status(500).json({ error: 'No se pudieron listar los pedidos' });
  }
};
