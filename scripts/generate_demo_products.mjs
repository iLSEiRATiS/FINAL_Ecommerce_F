// scripts/generate_demo_products.mjs
// Genera productos demo (6 por cada subcategoría "hoja") y los guarda en src/data/productos.json
// Requiere que tengas el árbol de categorías en: src/data/categorias.mjs (export const CATEGORIES = [...] )

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES } from '../src/data/categorias.mjs'; // <-- usamos la versión .mjs

// ----------------- Paths base -----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productosOutPath = path.resolve(__dirname, '../src/data/productos.json');

// ----------------- Utils -----------------
function slugify(s = '') {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, 'n')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Tu UI histórica usa URL-encoding en subcategoria_slug (ej: "pi%C3%B1atas"), lo mantenemos.
function urlEncodeSlug(s = '') {
  return encodeURIComponent(s);
}

// Recorre el árbol y devuelve TODAS las hojas con referencia a sus padres
function collectLeafNodes(nodes, parent1 = null, parent2 = null, acc = []) {
  for (const n of nodes) {
    const hasChildren = Array.isArray(n.children) && n.children.length > 0;
    if (!hasChildren) {
      acc.push({ label: n.label, parent1, parent2 }); // hoja
    } else {
      // Descendemos niveles
      if (!parent1) {
        collectLeafNodes(n.children, n.label, null, acc);      // estamos en nivel 1
      } else if (parent1 && !parent2) {
        collectLeafNodes(n.children, parent1, n.label, acc);   // estamos en nivel 2
      } else {
        collectLeafNodes(n.children, parent1, parent2, acc);   // más profundo (raro)
      }
    }
  }
  return acc;
}

// Precio aleatorio razonable
function randomPrice() {
  const min = 500, max = 12000, step = 10;
  return Math.round((Math.random() * (max - min) + min) / step) * step;
}

// ✅ Placeholder estable (evita DNS issues de via.placeholder.com)
function placeholder(label = '') {
  const text = encodeURIComponent(label);
  return `https://placehold.co/600x400?text=${text}`;
  // Alternativa (no muestra texto, pero siempre responde):
  // return `https://picsum.photos/seed/${text}/600/400`;
}

// ----------------- Generador -----------------
async function main() {
  // 1) Recolectar hojas (subcategorías finales)
  const leaves = collectLeafNodes(CATEGORIES);
  const items = [];
  let id = 1;

  for (const leaf of leaves) {
    // Reconstruimos niveles a partir de la hoja + padres
    const nivel1 = leaf.parent1 || leaf.label;             // L1 (si no hay parent1, la hoja es L1)
    const nivel2 = leaf.parent2 || (leaf.parent1 ? leaf.label : null); // L2 (si hay parent1 pero no parent2, la hoja hace de L2)
    const nivel3 = leaf.parent2 ? leaf.label : null;       // L3 (si hay parent2, la hoja es L3)

    const categoria = nivel1;                               // Visible L1
    const subcategoriaVisible = nivel3 ? `${nivel2}` : (nivel2 || leaf.label); // Texto que verá el usuario
    const subcategoriaLeaf = nivel3 ? nivel3 : subcategoriaVisible;            // La hoja real

    const categoria_slug = slugify(categoria);              // ej: "globos-y-pinatas"
    const subcategoria_slug = urlEncodeSlug(subcategoriaLeaf); // ej: "VELAS%20CON%20PALITO" (compat con tu filtro actual)

    // 6 productos por hoja
    for (let i = 1; i <= 6; i++) {
      const nombre = `${subcategoriaLeaf} ${i}`;
      items.push({
        id: id++,
        nombre,
        precio: randomPrice(),
        categoria,
        categoria_slug,
        subcategoria: subcategoriaVisible,
        subcategoria_slug,
        imagen: placeholder(`${categoria} - ${subcategoriaLeaf} ${i}`),
      });
    }
  }

  // 2) Guardar JSON
  fs.mkdirSync(path.dirname(productosOutPath), { recursive: true });
  fs.writeFileSync(productosOutPath, JSON.stringify(items, null, 2), 'utf8');

  console.log(`✓ Generado ${items.length} productos demo en ${productosOutPath}`);
}

// Ejecutar
main().catch((e) => {
  console.error('Error generando productos:', e);
  process.exit(1);
});
