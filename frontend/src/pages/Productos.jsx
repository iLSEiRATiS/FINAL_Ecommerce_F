// src/pages/Productos.jsx
import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SearchBar from '../components/SearchBar';
import productosData from '../data/productos.json';

// Pequeño formateador de moneda
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const SORTERS = {
  relevancia: { label: 'Relevancia', fn: (a, b) => 0 },
  precio_asc: { label: 'Precio: menor a mayor', fn: (a, b) => (a.precio ?? 0) - (b.precio ?? 0) },
  precio_desc: { label: 'Precio: mayor a menor', fn: (a, b) => (b.precio ?? 0) - (a.precio ?? 0) },
  nombre_asc: { label: 'Nombre: A-Z', fn: (a, b) => a.nombre.localeCompare(b.nombre) },
  nombre_desc: { label: 'Nombre: Z-A', fn: (a, b) => b.nombre.localeCompare(a.nombre) }
};

// Sidebar: categorías que ya manejamos
const CATS = [
  { key: 'cotillon', label: 'Cotillón', items: ['Velas', 'Bengalas', 'Confeti'] },
  { key: 'globos', label: 'Globos y Piñatas', items: ['Globos 9"', 'Globos 10"', 'Piñatas', 'Accesorios'] },
  { key: 'guirnaldas', label: 'Guirnaldas y Decoración', items: ['Banderines', 'Guirnaldas LED'] }
];

export default function Productos() {
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const qs = new URLSearchParams(location.search);
  const [search, setSearch] = useState(qs.get('search') ?? '');
  const [sortKey, setSortKey] = useState(qs.get('sort') ?? 'relevancia');
  const [cat, setCat] = useState(qs.get('cat') ?? '');            // categoría padre
  const [subcat, setSubcat] = useState(qs.get('subcat') ?? '');   // subcategoría

  // Sincronizo con URL para que puedas compartir filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (sortKey !== 'relevancia') params.set('sort', sortKey);
    if (cat) params.set('cat', cat);
    if (subcat) params.set('subcat', subcat);
    navigate({ pathname: '/productos', search: params.toString() }, { replace: true });
  }, [search, sortKey, cat, subcat, navigate]);

  // Lógica de filtrado
  const productos = useMemo(() => {
    const q = search.trim().toLowerCase();

    const matchesText = p =>
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      (p.subcategoria ?? '').toLowerCase().includes(q);

    const matchesCat = p =>
      (!cat || p.categoria_slug === cat) && (!subcat || (p.subcategoria_slug ?? '') === subcat);

    const arr = productosData.filter(p => matchesText(p) && matchesCat(p));
    return arr.sort(SORTERS[sortKey]?.fn ?? SORTERS.relevancia.fn);
  }, [search, sortKey, cat, subcat]);

  const chips = [
    ...(cat ? [CATS.find(c => c.key === cat)?.label ?? cat] : []),
    ...(subcat ? [decodeURIComponent(subcat)] : []),
    ...(search.trim() ? [`“${search.trim()}”`] : [])
  ];

  const clearFilters = () => { setCat(''); setSubcat(''); setSearch(''); };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h2 className="mb-0">🎯 Destacados</h2>
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
                <button className="btn btn-link p-0 small" onClick={clearFilters}>Limpiar</button>
              </div>
              <ul className="list-unstyled mb-0">
                {CATS.map(group => (
                  <li key={group.key} className="mb-2">
                    <button
                      className={`side-head ${cat === group.key ? 'active' : ''}`}
                      onClick={() => { setCat(group.key === cat ? '' : group.key); setSubcat(''); }}
                    >
                      <span>{group.label}</span>
                      <span className="chev">▾</span>
                    </button>
                    {cat === group.key && (
                      <ul className="list-unstyled ps-3 pt-1">
                        {group.items.map(it => {
                          const slug = encodeURIComponent(it.toLowerCase());
                          return (
                            <li key={it}>
                              <button
                                className={`side-leaf ${subcat === slug ? 'active' : ''}`}
                                onClick={() => setSubcat(subcat === slug ? '' : slug)}
                              >
                                {it}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                ))}
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
          {/* Chips de filtros activos */}
          {chips.length > 0 && (
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              {chips.map((c, i) => (
                <Badge key={`${c}-${i}`} bg="warning" text="dark" className="filter-chip">{c}</Badge>
              ))}
              <Button size="sm" variant="outline-secondary" onClick={clearFilters}>Quitar filtros</Button>
            </div>
          )}

          {/* Grilla de productos */}
          <Row className="g-4">
            {productos.map(p => (
              <Col key={p.id} xs={12} sm={6} md={4}>
                <div className="product-card h-100 d-flex flex-column">
                  <div className="product-img-wrap">
                    <img src={p.imagen} alt={p.nombre} />
                    <span className="badge badge-category">{p.categoria}</span>
                  </div>
                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <h6 className="mb-1 text-truncate" title={p.nombre}>{p.nombre}</h6>
                    <div className="text-muted small mb-2">ID: {p.id}</div>
                    <div className="fw-bold mb-3">{money.format(p.precio ?? 0)}</div>
                    <Button className="mt-auto" variant="primary" onClick={() => addToCart(p)}>
                      Agregar al carrito
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
            {productos.length === 0 && (
              <Col>
                <div className="empty-state text-center py-5">
                  <div className="display-6 mb-2">😕</div>
                  <p>No hay productos con esos filtros.</p>
                  <Button variant="outline-secondary" size="sm" onClick={clearFilters}>Ver todo</Button>
                </div>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
