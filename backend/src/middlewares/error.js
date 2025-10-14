function notFound(req, res, next) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (err?.code === 11000) return res.status(409).json({ error: 'Registro duplicado' });
  if (err?.name === 'ZodError') {
    const msg = err.issues?.[0]?.message || 'Datos inválidos';
    return res.status(400).json({ error: msg });
  }
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
}

module.exports = { notFound, errorHandler };
