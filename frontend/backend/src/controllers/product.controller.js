const Product = require('../models/Product');
const Category = require('../models/Category');
const { buildPagination } = require('../utils/paginate');

async function list(req, res) {
  const { q, category, page, limit } = req.query;
  const { skip, limit: lim, page: pg } = buildPagination({ page, limit });

  const where = { active: true };
  if (q) where.name = { $regex: String(q), $options: 'i' };
  if (category) {
    const cat = await Category.findOne({ $or: [{ slug: category }, { _id: category }] }).lean();
    if (cat) where.category = cat._id;
  }

  const [items, total] = await Promise.all([
    Product.find(where).sort({ createdAt: -1 }).skip(skip).limit(lim).populate('category').lean(),
    Product.countDocuments(where)
  ]);

  res.json({ items, total, page: pg, pages: Math.ceil(total / lim) });
}

async function getOne(req, res) {
  const { id } = req.params;
  const item = await Product.findOne({ $or: [{ _id: id }, { slug: id }] }).populate('category').lean();
  if (!item) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(item);
}

module.exports = { list, getOne };
