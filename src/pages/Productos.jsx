// src/pages/Productos.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Container, Row, Col, Button, Dropdown, Badge, Pagination, Form,
  Breadcrumb, Toast, ToastContainer, Placeholder, Card
} from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SearchBar from '../components/SearchBar';
import productosData from '../data/productos.json';

// ========================= Utils =========================
const slugify = (str = '') =>
  str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, 'n')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const norm = (s = '') =>
  s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, 'n')
    .toLowerCase();

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const SORTERS = {
  relevancia: { label: 'Relevancia', fn: () => 0 },
  precio_asc: { label: 'Precio: menor a mayor', fn: (a, b) => (a.precio ?? 0) - (b.precio ?? 0) },
  precio_desc: { label: 'Precio: mayor a menor', fn: (a, b) => (b.precio ?? 0) - (a.precio ?? 0) },
  nombre_asc: { label: 'Nombre: A-Z', fn: (a, b) => a.nombre.localeCompare(b.nombre) },
  nombre_desc: { label: 'Nombre: Z-A', fn: (a, b) => b.nombre.localeCompare(a.nombre) }
};

// ========================= Categorías =========================
const RAW_CATS = [
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
        ]
      },
      { label: 'VINCHAS Y CORONAS' },
      { label: 'GORROS Y SOMBREROS' },
      { label: 'ANTIFACES' },
      { label: 'CARIOCA' },
    ]
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
        ]
      },
      {
        label: '10 PULGADAS',
        children: [
          { label: 'PERLADO' },
          { label: 'LISO' },
        ]
      },
      {
        label: '12 PULGADAS',
        children: [
          { label: 'PERLADO' },
          { label: 'LISO' },
        ]
      },
      { label: 'GLOBOLOGIA' },
    ]
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
    ]
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
    ]
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
    ]
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

const mapCats = (nodes, parent = null) =>
  nodes.map(n => {
    const slug = slugify(n.label);
    const node = { label: n.label, slug, parentSlug: parent?.slug || null };
    if (n.children) node.children = mapCats(n.children, node);
    return node;
  });

const CATS_TREE = mapCats(RAW_CATS);

const findBySlug = (nodes, slug) => {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    if (n.children) {
      const f = findBySlug(n.children, slug);
      if (f) return f;
    }
  }
  return null;
};
const getTopLevel = () => CATS_TREE;
const leafSlugs = (node) => {
  if (!node?.children || node.children.length === 0) return [node.slug];
  return node.children.flatMap(leafSlugs);
};

// ========================= Página =========================
export default function Productos() {
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Ref al inicio de la grilla para scroll suave al paginar
  const gridTopRef = useRef(null);

  // Query params
  const qs = new URLSearchParams(location.search);
  const [search, setSearch] = useState(qs.get('search') ?? '');
  const [sortKey, setSortKey] = useState(qs.get('sort') ?? 'relevancia');
  const [cat, setCat] = useState(qs.get('cat') ?? '');
  const [subcat, setSubcat] = useState(qs.get('subcat') ?? '');
  const [expandedL2, setExpandedL2] = useState(null);

  // Paginación
  const initialPer = Number(qs.get('per') || 12);
  const initialPage = Number(qs.get('page') || 1);
  const [per, setPer] = useState([12,24,48].includes(initialPer) ? initialPer : 12);
  const [page, setPage] = useState(initialPage > 0 ? initialPage : 1);

  // NUEVO: carga para skeletons
  const [loading, setLoading] = useState(true);

  // NUEVO: toast al agregar
  const [toast, setToast] = useState({ show: false, title: '', body: '' });

  // Sincronizar URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (sortKey !== 'relevancia') params.set('sort', sortKey);
    if (cat) params.set('cat', cat);
    if (subcat) params.set('subcat', subcat);
    if (per !== 12) params.set('per', String(per));
    if (page !== 1) params.set('page', String(page));
    navigate({ pathname: '/productos', search: params.toString() }, { replace: true });
  }, [search, sortKey, cat, subcat, per, page, navigate]);

  // Resetear a página 1 ante cambios de filtros/orden/busqueda/tamaño
  useEffect(() => { setPage(1); }, [search, sortKey, cat, subcat, per]);

  // Atajos de teclado: ← anterior, → siguiente
  useEffect(() => {
    const handler = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPage(prev => Math.max(1, prev - 1));
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPage(prev => prev + 1); // validaremos contra totalPages luego
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Filtrado + Orden
  const filtered = useMemo(() => {
    const q = norm(search);

    const matchesText = (p) => {
      const fields = [p.nombre, p.categoria, p.subcategoria, p.subsubcategoria]
        .filter(Boolean).map(norm);
      if (!q) return true;
      return fields.some(f => f.includes(q));
    };

    const matchesCat = (p) => {
      if (!cat && !subcat) return true;
      const pCat = (p.categoria_slug || slugify(p.categoria || '')).toLowerCase();
      const pSub = (p.subcategoria_slug || slugify(p.subcategoria || p.subsubcategoria || '')).toLowerCase();

      if (cat && pCat !== cat) return false;
      if (!subcat) return true;

      const node = findBySlug(CATS_TREE, subcat);
      if (node?.children?.length) {
        const leaves = leafSlugs(node);
        return leaves.includes(pSub);
      }
      return pSub === subcat;
    };

    return productosData
      .filter(p => matchesText(p) && matchesCat(p))
      .sort(SORTERS[sortKey]?.fn ?? SORTERS.relevancia.fn);
  }, [search, sortKey, cat, subcat]);

  // Paginación (slice)
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / per));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * per;
  const endIdx = Math.min(startIdx + per, total);
  const paginated = filtered.slice(startIdx, endIdx);

  // Ajustar si el atajo se pasó del límite superior
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Scroll suave al inicio de la grilla cada vez que cambia de página
  useEffect(() => {
    if (gridTopRef.current) {
      const y = gridTopRef.current.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [safePage]);

  // NUEVO: Skeletons (activar en cada cambio relevante)
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 300); // UX delay
    return () => clearTimeout(t);
  }, [search, sortKey, cat, subcat, per, page]);

  // Render pagination numbers
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxButtons = 7; // cantidad visible total
    const go = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

    // Siempre: First / Prev
    items.push(
      <Pagination.First key="first" disabled={safePage === 1} onClick={() => go(1)} />,
      <Pagination.Prev key="prev" disabled={safePage === 1} onClick={() => go(safePage - 1)} />
    );

    // Rango central con elipsis
    if (totalPages <= maxButtons) {
      for (let p = 1; p <= totalPages; p++) {
        items.push(
          <Pagination.Item key={p} active={p === safePage} onClick={() => go(p)}>
            {p}
          </Pagination.Item>
        );
      }
    } else {
      const neighbors = 1;
      const start = Math.max(2, safePage - neighbors);
      const end = Math.min(totalPages - 1, safePage + neighbors);

      items.push(
        <Pagination.Item key={1} active={safePage === 1} onClick={() => go(1)}>
          1
        </Pagination.Item>
      );
      if (start > 2) items.push(<Pagination.Ellipsis key="ell-start" disabled />);

      for (let p = start; p <= end; p++) {
        items.push(
          <Pagination.Item key={p} active={p === safePage} onClick={() => go(p)}>
            {p}
          </Pagination.Item>
        );
      }

      if (end < totalPages - 1) items.push(<Pagination.Ellipsis key="ell-end" disabled />);
      items.push(
        <Pagination.Item key={totalPages} active={safePage === totalPages} onClick={() => go(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    // Siempre: Next / Last
    items.push(
      <Pagination.Next key="next" disabled={safePage === totalPages} onClick={() => go(safePage + 1)} />,
      <Pagination.Last key="last" disabled={safePage === totalPages} onClick={() => go(totalPages)} />
    );

    return <Pagination className="mb-0">{items}</Pagination>;
  };

  // NUEVO: helper add con toast
  const handleAdd = (p) => {
    addToCart(p, 1);
    setToast({ show: true, title: 'Producto agregado', body: `${p.nombre} fue agregado al carrito.` });
  };

  // NUEVO: Breadcrumb compuesto según estado
  const breadcrumbItems = (() => {
    const items = [
      <Breadcrumb.Item key="home" linkAs={Link} linkProps={{ to: '/' }}>Inicio</Breadcrumb.Item>,
    ];
    const hasCatOrSearch = !!cat || !!search.trim();
    items.push(
      <Breadcrumb.Item key="prod" active={!hasCatOrSearch}>Productos</Breadcrumb.Item>
    );

    if (cat) {
      const n1 = findBySlug(CATS_TREE, cat);
      if (n1) items.push(<Breadcrumb.Item key="cat" active={!subcat && !search}>{n1.label}</Breadcrumb.Item>);
    }
    if (subcat) {
      const n2 = findBySlug(CATS_TREE, subcat);
      if (n2) items.push(<Breadcrumb.Item key="subcat" active>{n2.label}</Breadcrumb.Item>);
    }
    if (!cat && search.trim()) {
      items.push(<Breadcrumb.Item key="search" active>Resultados para “{search.trim()}”</Breadcrumb.Item>);
    }
    return items;
  })();

  return (
    <Container className="py-4">
      {/* BREADCRUMB */}
      <Row>
        <Col>
          <Breadcrumb className="mb-3">{breadcrumbItems}</Breadcrumb>
        </Col>
      </Row>

      <Row className="mb-3 align-items-center">
        <Col>
          <h2 className="mb-0">Catálogo</h2>
          <small className="text-muted">
            Filtrá por categoría o buscá por nombre/subcategoría.
          </small>
        </Col>
        <Col className="d-flex justify-content-end align-items-center gap-2">
          <span className="text-muted small">Ordenar por</span>
          <Dropdown align="end">
            <Dropdown.Toggle size="sm" variant="light">
              {SORTERS[sortKey].label}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.entries(SORTERS).map(([k, v]) => (
                <Dropdown.Item key={k} active={k === sortKey} onClick={() => setSortKey(k)}>
                  {v.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Sidebar categorías */}
        <Col lg={3}>
          <aside className="side-panel">
            <div className="side-section">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="m-0">Categorías</h6>
                <button
                  className="btn btn-link p-0 small"
                  onClick={() => { setCat(''); setSubcat(''); setExpandedL2(null); }}
                >
                  Limpiar
                </button>
              </div>
              <ul className="list-unstyled mb-0">
                {getTopLevel().map(group => {
                  const isActiveGroup = cat === group.slug;
                  return (
                    <li key={group.slug} className="mb-2">
                      <button
                        className={`side-head ${isActiveGroup ? 'active' : ''}`}
                        onClick={() => {
                          setCat(isActiveGroup ? '' : group.slug);
                          setSubcat('');
                          setExpandedL2(null);
                        }}
                      >
                        <span>{group.label}</span>
                        <span className="chev">▾</span>
                      </button>

                      {isActiveGroup && (
                        <ul className="list-unstyled ps-3 pt-1">
                          {!group.children?.length && (
                            <li className="text-muted small">Sin subcategorías</li>
                          )}

                          {group.children?.map(l2 => {
                            const l2HasChildren = !!l2.children?.length;
                            const isL2Expanded = expandedL2 === l2.slug;
                            const isL2Chosen = subcat === l2.slug;

                            return (
                              <li key={l2.slug} className="mb-1">
                                <button
                                  className={`side-leaf ${isL2Chosen ? 'active' : ''}`}
                                  onClick={() => {
                                    if (l2HasChildren) {
                                      setExpandedL2(isL2Expanded ? null : l2.slug);
                                    } else {
                                      setSubcat(isL2Chosen ? '' : l2.slug);
                                    }
                                  }}
                                >
                                  {l2.label}{l2HasChildren ? ' ▸' : ''}
                                </button>

                                {l2HasChildren && isL2Expanded && (
                                  <ul className="list-unstyled ps-3 pt-1">
                                    {l2.children.map(l3 => {
                                      const isL3Chosen = subcat === l3.slug;
                                      return (
                                        <li key={l3.slug}>
                                          <button
                                            className={`side-leaf ${isL3Chosen ? 'active' : ''}`}
                                            onClick={() => setSubcat(isL3Chosen ? '' : l3.slug)}
                                          >
                                            {l3.label}
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="side-section mt-4">
              <h6 className="mb-2">Buscar</h6>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Por nombre o categoría…"
                ariaLabel="Buscar productos"
              />
            </div>
          </aside>
        </Col>

        {/* Contenido principal */}
        <Col lg={9}>
          {/* Ancla para scroll al paginar */}
          <div ref={gridTopRef} />

          {/* Chips de filtros activos */}
          {(() => {
            const chips = [];
            if (cat) {
              const n1 = findBySlug(CATS_TREE, cat);
              if (n1) chips.push(n1.label);
            }
            if (subcat) {
              const n = findBySlug(CATS_TREE, subcat);
              if (n) chips.push(n.label);
            }
            if (search.trim()) chips.push(`“${search.trim()}”`);

            if (!chips.length || loading) return null;
            return (
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                {chips.map((c, i) => (
                  <Badge key={`${c}-${i}`} bg="warning" text="dark" className="filter-chip">{c}</Badge>
                ))}
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => { setCat(''); setSubcat(''); setSearch(''); setExpandedL2(null); }}
                >
                  Quitar filtros
                </Button>
              </div>
            );
          })()}

          {/* Barra superior: contador + tamaño de página */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <div className="text-muted small">
              {loading
                ? 'Cargando…'
                : total === 0
                ? 'Sin resultados'
                : `Mostrando ${startIdx + 1}–${endIdx} de ${total}`}
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Ver</span>
              <Form.Select
                size="sm"
                value={per}
                onChange={(e) => setPer(Number(e.target.value))}
                style={{ width: 96 }}
                aria-label="Cantidad por página"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </Form.Select>
              <span className="text-muted small">por página</span>
            </div>
          </div>

          {/* Grilla de productos (paginada) */}
          <Row className="g-4">
            {loading ? (
              Array.from({ length: per }).map((_, idx) => (
                <Col key={`sk-${idx}`} xs={12} sm={6} md={4}>
                  <Card className="h-100">
                    <div className="bg-light" style={{ height: 180 }} />
                    <Card.Body>
                      <Placeholder as={Card.Title} animation="glow">
                        <Placeholder xs={8} /> <Placeholder xs={4} />
                      </Placeholder>
                      <Placeholder as="p" animation="glow">
                        <Placeholder xs={6} /> <Placeholder xs={5} /> <Placeholder xs={7} />
                      </Placeholder>
                      <Placeholder.Button variant="secondary" xs={6} />
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <>
                {paginated.map(p => (
                  <Col key={p.id || `${p.categoria}-${p.nombre}`} xs={12} sm={6} md={4}>
                    <div className="product-card h-100 d-flex flex-column">
                      <div className="product-img-wrap">
                        {p.imagen ? (
                          <img
                            src={p.imagen}
                            alt={p.nombre}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x400?text=Imagen'; }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center bg-light"
                            style={{ height: 160, borderRadius: 8, color: '#9aa' }}
                          >
                            Sin imagen
                          </div>
                        )}
                        <span className="badge badge-category">{p.categoria}</span>
                      </div>
                      <div className="p-3 d-flex flex-column flex-grow-1">
                        <h6 className="mb-1 text-truncate" title={p.nombre}>{p.nombre}</h6>
                        <div className="text-muted small mb-2">
                          {(p.subsubcategoria ? `${p.subcategoria} · ${p.subsubcategoria}` : p.subcategoria) || '—'}
                        </div>
                        <div className="fw-bold mb-3">{money.format(p.precio ?? 0)}</div>
                        <Button className="mt-auto" variant="primary" onClick={() => handleAdd(p)}>
                          Agregar al carrito
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
                {paginated.length === 0 && (
                  <Col>
                    <div className="empty-state text-center py-5">
                      <div className="display-6 mb-2">😕</div>
                      <p>No hay productos con esos filtros.</p>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => { setCat(''); setSubcat(''); setSearch(''); setExpandedL2(null); }}
                      >
                        Ver todo
                      </Button>
                    </div>
                  </Col>
                )}
              </>
            )}
          </Row>

          {/* Paginación inferior */}
          <div className="d-flex justify-content-center mt-4">
            {renderPagination()}
          </div>
        </Col>
      </Row>

      {/* TOASTS */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="light"
          onClose={() => setToast(t => ({ ...t, show: false }))}
          show={toast.show}
          delay={2000}
          autohide
        >
          <Toast.Header closeButton>
            <strong className="me-auto">{toast.title}</strong>
            <small>Ahora</small>
          </Toast.Header>
          <Toast.Body>{toast.body}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
