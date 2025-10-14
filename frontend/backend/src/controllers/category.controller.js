const Category = require('../models/Category');


async function list(req, res) {
const cats = await Category.find().lean();
res.json(cats);
}


async function tree(req, res) {
const nodes = await Category.find().lean();
const byId = Object.fromEntries(nodes.map(n => [n._id.toString(), { ...n, children: [] }]));
const roots = [];
for (const n of Object.values(byId)) {
if (n.parent) byId[n.parent.toString()]?.children.push(n); else roots.push(n);
}
res.json(roots);
}


module.exports = { list, tree };