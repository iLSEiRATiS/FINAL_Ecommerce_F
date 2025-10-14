require('dotenv').config();
async function upsertCategoryByPath(names, cache) {
let parent = null; let last = null;
for (const name of names) {
const slug = slugify(name);
const key = `${parent || 'root'}>${slug}`;
if (cache.has(key)) { parent = cache.get(key)._id; last = cache.get(key); continue; }
const doc = await Category.findOneAndUpdate({ slug, parent }, { name, slug, parent }, { new: true, upsert: true });
cache.set(key, doc);
parent = doc._id; last = doc;
}
return last; // última como categoría del producto
}


async function importCategorias() {
const raw = readCategorias();
const cache = new Map();
async function walk(node, parents = []) {
if (typeof node === 'string') {
await upsertCategoryByPath([...parents, node], cache);
return;
}
const name = node.nombre || node.name;
const hijos = node.hijos || node.subcategorias || [];
const current = await upsertCategoryByPath([...parents, name], cache);
for (const h of hijos) await walk(h, [...parents, name]);
return current;
}
for (const n of raw) await walk(n, []);
}


async function importProductos() {
// Intento leer desde varias posibles ubicaciones
const candidates = [
path.join(__dirname, 'data', 'productos.json'),
path.join(process.cwd(), '..', 'frontend', 'src', 'data', 'productos.json')
];
const arr = readJSONMaybe(...candidates);
if (!arr) {
console.log('productos.json no encontrado. Creando algunos de ejemplo.');
const cat = await Category.findOne();
const catId = cat?._id;
const sample = [
{ nombre: 'Ejemplo Globos', precio: 150, categoria: 'Globos y Piñatas', imagen: 'https://via.placeholder.com/600x400?text=Globos' },
{ nombre: 'Ejemplo Bengalas', precio: 1200, categoria: 'Cotillón > Velas > Bengalas', imagen: 'https://via.placeholder.com/600x400?text=Bengalas' }
];
for (const p of sample) {
const names = String(p.categoria || '').split('>').map(s => s.trim()).filter(Boolean);
const leaf = names.length ? await upsertCategoryByPath(names, new Map()) : null;
await Product.create({
name: p.nombre,
price: Number(p.precio) || 0,
images: p.imagen ? [p.imagen] : [],
category: leaf ? leaf._id : catId
});
}
return;
}


// Transformo desde tu forma: { id, nombre, precio, categoria, imagen }
for (const p of arr) {
const names = String(p.categoria || '').split('>').map(s => s.trim()).filter(Boolean);
let leaf = null;
if (names.length) leaf = await upsertCategoryByPath(names, new Map());
await Product.create({
name: p.nombre || p.name,
price: Number(p.precio ?? p.price ?? 0),
images: p.imagen ? [p.imagen] : Array.isArray(p.imagenes) ? p.imagenes : [],
category: leaf?._id || null,
description: p.descripcion || ''
});
}
}


(async () => {
await connectDB();
const reset = process.argv.includes('--reset');
if (reset) {
await Promise.all([
Product.deleteMany({}),
Category.deleteMany({})
]);
console.log('Colecciones vaciadas.');
}
await importCategorias();
await importProductos();
console.log('Seed completo.');
process.exit(0);
})();