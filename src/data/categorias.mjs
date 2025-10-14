// src/data/categorias.js
// Árbol de categorías con hasta 3 niveles.
// Las hojas (nodos sin children) recibirán 6 productos demo en el script.

export const CATEGORIES = [
  {
    label: 'COTILLON',
    children: [
      {
        label: 'VELAS',
        children: [
          { label: 'VELAS CON PALITO' },
          { label: 'VELAS IMPORTADAS' },
          { label: 'BENGALAS' },
          { label: 'VELAS CON LUZ' },
          { label: 'VELAS ESTRELLITA' },
        ],
      },
      { label: 'VINCHAS Y CORONAS' },
      { label: 'GORROS Y SOMBREROS' },
      { label: 'ANTIFACES' },
      { label: 'CARIOCA' },
    ],
  },
  {
    label: 'GLOBOS Y PIÑATAS',
    children: [
      { label: 'NÚMERO METALIZADOS' },
      { label: 'GLOBOS CON FORMA' },
      { label: 'SET DE GLOBOS' },
      {
        label: '9 PULGADAS',
        children: [
          { label: 'PERLADO' },
          { label: 'LISO' },
        ],
      },
      {
        label: '10 PULGADAS',
        children: [
          { label: 'PERLADO' },
          { label: 'LISO' },
        ],
      },
      {
        label: '12 PULGADAS',
        children: [
          { label: 'PERLADO' },
          { label: 'LISO' },
        ],
      },
      { label: 'GLOBOLOGIA' },
    ],
  },
  { label: 'GUIRNALDAS Y DECORACIÓN' },
  { label: 'DECORACION PARA TORTAS' },
  { label: 'DECORACIÓN LED' },
  { label: 'LUMINOSO' },
  { label: 'LIBRERÍA' },
  {
    label: 'DISFRACES',
    children: [
      { label: 'EXTENSIONES PELUCAS Y PINTURA' },
      { label: 'MAQUILLAJE' },
      { label: 'CARETAS' },
      { label: 'TUTÚS' },
      { label: 'ALAS' },
    ],
  },
  {
    label: 'DESCARTABLES',
    children: [
      { label: 'BANDEJAS CARTÓN' },
      { label: 'BANDEJAS PLASTICAS' },
      { label: 'MANTELES' },
      { label: 'CUBIERTOS' },
      { label: 'PLATOS' },
      { label: 'POTES' },
      { label: 'SERVILLETAS' },
      { label: 'VASOS Y COPAS' },
      { label: 'BLONDAS' },
    ],
  },
  {
    label: 'REPOSTERIA',
    children: [
      { label: 'PARPEN' },
      { label: 'LODISER' },
      { label: 'BALLINA' },
      { label: 'DEWEY' },
      { label: 'COMESTIBLES' },
      { label: 'PLACAS PLÁSTICAS' },
      { label: 'MOLDES' },
      {
        label: 'DECORACION TORTAS-TOPPER',
        children: [{ label: 'ADORNOS TELGOPOR' }],
      },
    ],
  },
  { label: 'MINIATURAS-JUGUETITOS' },
  {
    label: 'FECHAS ESPECIALES',
    children: [{ label: 'PATRIOS' }, { label: 'PASCUAS' }, { label: 'HALLOWEN' }],
  },
  { label: 'LANZAPAPELITOS' },
  {
    label: 'PAPELERA',
    children: [
      { label: 'CAJITAS' },
      { label: 'HILO DE ALGODÓN' },
      { label: 'BOLSITAS DE REGALO' },
      { label: 'BOLSITAS DE GASA' },
      { label: 'BOLSAS PLÁSTICAS' },
    ],
  },
  { label: 'ARTICULOS CON SONIDO' },
  { label: 'ARTICULOS EN TELGOPOR' },
  { label: 'ARTÍCULOS PARA MANUALIDADES' },
  { label: 'ARTÍCULOS PARA COMUNIÓN' },
];

export default CATEGORIES;
