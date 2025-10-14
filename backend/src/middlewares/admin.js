function admin(req, res, next) {
  if (req.userRole === 'admin') return next();
  return res.status(403).json({ error: 'Requiere rol admin' });
}
module.exports = admin;
