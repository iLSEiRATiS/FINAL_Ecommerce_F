// scripts/generate_demo_products.mjs
// Genera datos demo en src/data/productos.json a partir de un árbol de categorías
// Uso:
//   node scripts/generate_demo_products.mjs
//   node scripts/generate_demo_products.mjs  (usa 6 por categoría por defecto)
//   node scripts/generate_demo_products.mjs --per=8
//
// Config opcional por entorno:
//   PRODUCTS_PER_LEAF=8 PLACEHOLDER_HOST=https://placehold.co node scripts/generate_demo_products.mjs
//
// Nota: requiere Node 16+ y package.json con "type":"module" (ver instrucciones abajo)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ---------- Helpers ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const OUTFILE = path.join(ROOT, "src", "data", "productos.json");

const ARG_PER = (() => {
  const perFlag = process.argv.find(a => a.startsWith("--per="));
  if (perFlag) {
    const v = Number(perFlag.split("=")[1]);
    return Number.isFinite(v) && v > 0 ? v : 6;
  }
  return null;
})();

const PRODUCTS_PER_LEAF = Number(
  ARG_PER ?? process.env.PRODUCTS_PER_LEAF ?? 6
);

const PLACEHOLDER_HOST = String(
  process.env.PLACEHOLDER_HOST ?? "https://placehold.co"
).replace(/\/+$/,"");

/* ---------- Árbol de categorías (el mismo universo que usamos en Productos.jsx) ---------- */
const RAW_CATS = [
  {
    label: "COTILLON",
    children: [
      {
        label: "VELAS",
        children: [
          { label: "VELAS CON PALITO" },
          { label: "VELAS IMPORTADAS" },
          { label: "BENGALAS" },
          { label: "VELAS CON LUZ" },
          { label: "VELAS ESTRELLITA" },
        ],
      },
      { label: "VINCHAS Y CORONAS" },
      { label: "GORROS Y SOMBREROS" },
      { label: "ANTIFACES" },
      { label: "CARIOCA" },
    ],
  },
  {
    label: "GLOBOS Y PIÑATAS",
    children: [
      { label: "NÚMERO METALIZADOS" },
      { label: "GLOBOS CON FORMA" },
      { label: "SET DE GLOBOS" },
      {
        label: "9 PULGADAS",
        children: [{ label: "PERLADO" }, { label: "LISO" }],
      },
      {
        label: "10 PULGADAS",
        children: [{ label: "PERLADO" }, { label: "LISO" }],
      },
      {
        label: "12 PULGADAS",
        children: [{ label: "PERLADO" }, { label: "LISO" }],
      },
      { label: "GLOBOLOGIA" },
    ],
  },
  { label: "GUIRNALDAS Y DECORACIÓN" },
  { label: "DECORACION PARA TORTAS" },
  { label: "DECORACIÓN LED" },
  { label: "LUMINOSO" },
  { label: "LIBRERÍA" },
  {
    label: "DISFRACES",
    children: [
      { label: "EXTENSIONES PELUCAS Y PINTURA" },
      { label: "MAQUILLAJE" },
      { label: "CARETAS" },
      { label: "TUTÚS" },
      { label: "ALAS" },
    ],
  },
  {
    label: "DESCARTABLES",
    children: [
      { label: "BANDEJAS CARTÓN" },
      { label: "BANDEJAS PLASTICAS" },
      { label: "MANTELES" },
      { label: "CUBIERTOS" },
      { label: "PLATOS" },
      { label: "POTES" },
      { label: "SERVILLETAS" },
      { label: "VASOS Y COPAS" },
      { label: "BLONDAS" },
    ],
  },
  {
    label: "REPOSTERIA",
    children: [
      { label: "PARPEN" },
      { label: "LODISER" },
      { label: "BALLINA" },
      { label: "DEWEY" },
      { label: "COMESTIBLES" },
      { label: "PLACAS PLÁSTICAS" },
      { label: "MOLDES" },
      {
        label: "DECORACION TORTAS-TOPPER",
        children: [{ label: "ADORNOS TELGOPOR" }],
      },
    ],
  },
  { label: "MINIATURAS-JUGUETITOS" },
  {
    label: "FECHAS ESPECIALES",
    children: [{ label: "PATRIOS" }, { label: "PASCUAS" }, { label: "HALLOWEN" }],
  },
  { label: "LANZAPAPELITOS" },
  {
    label: "PAPELERA",
    children: [
      { label: "CAJITAS" },
      { label: "HILO DE ALGODÓN" },
      { label: "BOLSITAS DE REGALO" },
      { label: "BOLSITAS DE GASA" },
      { label: "BOLSAS PLÁSTICAS" },
    ],
  },
  { label: "ARTICULOS CON SONIDO" },
  { label: "ARTICULOS EN TELGOPOR" },
  { label: "ARTÍCULOS PARA MANUALIDADES" },
  { label: "ARTÍCULOS PARA COMUNIÓN" },
];

/* ---------- Utils ---------- */
const slugify = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const flattenLeaves = (node, parent = null, acc = []) => {
  const item = {
    label: node.label,
    slug: slugify(node.label),
    parentLabel: parent?.label ?? null,
    parentSlug: parent ? slugify(parent.label) : null,
  };
  if (node.children?.length) {
    node.children.forEach((c) => flattenLeaves(c, item, acc));
  } else {
    acc.push(item);
  }
  return acc;
};

const allLeaves = RAW_CATS.flatMap((n) => flattenLeaves(n));

/* ---------- Generación ---------- */
let idCounter = 1;
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeImage = (cat, sub, idx) => {
  // Ej: https://placehold.co/600x400?text=COTILLON%20-%20VELAS%20CON%20PALITO%201
  const txt = encodeURIComponent(
    `${cat}${sub ? " - " + sub : ""} ${idx}`.toUpperCase()
  );
  return `${PLACEHOLDER_HOST}/600x400?text=${txt}`;
};

const productos = [];
for (const leaf of allLeaves) {
  const categoria = leaf.parentLabel || leaf.label;
  const categoria_slug = slugify(categoria);
  const subcategoria = leaf.parentLabel ? leaf.label : null;
  const subcategoria_slug = subcategoria ? slugify(subcategoria) : null;

  for (let i = 1; i <= PRODUCTS_PER_LEAF; i++) {
    const nombreBase = subcategoria || categoria;
    const nombre = `${nombreBase} ${i}`;
    const precio = rnd(300, 15000); // ARS demo
    const imagen = makeImage(categoria, subcategoria, i);

    productos.push({
      id: idCounter++,
      nombre,
      precio,
      categoria,
      categoria_slug,
      subcategoria: subcategoria ?? undefined,
      subcategoria_slug: subcategoria_slug ?? undefined,
      imagen,
    });
  }
}

/* ---------- Escritura ---------- */
fs.mkdirSync(path.dirname(OUTFILE), { recursive: true });
fs.writeFileSync(OUTFILE, JSON.stringify(productos, null, 2), "utf-8");

console.log(
  `✓ Generado ${productos.length} productos demo en ${OUTFILE}\n` +
    `   Por hoja: ${PRODUCTS_PER_LEAF} | Placeholder: ${PLACEHOLDER_HOST}`
);
