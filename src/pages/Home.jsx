// src/pages/Home.jsx
import { Container, Row, Col, Carousel, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const slides = [
  {
    img: 'https://source.unsplash.com/1200x420/?party,celebration',
    title: 'Cotillón mayorista',
    text: 'Todo para tus fiestas, al mejor precio.',
    cta: { to: '/productos', label: 'Ver catálogo' },
  },
  {
    img: 'https://source.unsplash.com/1200x420/?balloons,party',
    title: 'Globos y Piñatas',
    text: 'Variedad de tamaños y colores.',
    cta: { to: '/productos?search=globos', label: 'Explorar globos' },
  },
  {
    img: 'https://source.unsplash.com/1200x420/?candles,party,decor',
    title: 'Decoración y velas',
    text: 'Guirnaldas LED, velas importadas y más.',
    cta: { to: '/productos?search=velas', label: 'Ver decoración' },
  },
];

const categoriasDestacadas = [
  {
    title: 'Velas y Bengalas',
    img: 'https://source.unsplash.com/600x400/?birthday,candles',
    search: 'velas',
  },
  {
    title: 'Globos 9" · 10" · 12"',
    img: 'https://source.unsplash.com/600x400/?balloons',
    search: 'globos',
  },
  {
    title: 'Piñatas',
    img: 'https://source.unsplash.com/600x400/?pinata,party',
    search: 'piñatas',
  },
  {
    title: 'Guirnaldas y Decoración',
    img: 'https://source.unsplash.com/600x400/?string-lights,garland',
    search: 'guirnaldas',
  },
  {
    title: 'Descartables',
    img: 'https://source.unsplash.com/600x400/?paper-cups,party',
    search: 'descartables',
  },
  {
    title: 'Repostería',
    img: 'https://source.unsplash.com/600x400/?baking,cupcakes,decorations',
    search: 'reposteria',
  },
];

const productosDestacados = [
  {
    title: 'Velas con Palito x10',
    price: 580,
    img: 'https://source.unsplash.com/600x400/?birthday-candles',
    search: 'velas con palito',
  },
  {
    title: 'Bengalas Fiesta N°8',
    price: 1200,
    img: 'https://source.unsplash.com/600x400/?sparklers,party',
    search: 'bengalas',
  },
  {
    title: 'Globos 10" Perlados x50',
    price: 2100,
    img: 'https://source.unsplash.com/600x400/?balloons,helium',
    search: 'globos 10',
  },
  {
    title: 'Guirnaldas LED 5m',
    price: 3100,
    img: 'https://source.unsplash.com/600x400/?fairy-lights,led',
    search: 'guirnaldas led',
  },
];

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const Home = () => {
  return (
    <main role="main">
      {/* HERO / CARRUSEL */}
      <Carousel className="shadow-sm">
        {slides.map((s, i) => (
          <Carousel.Item key={i}>
            <img
              className="d-block w-100"
              src={s.img}
              alt={s.title}
              style={{ maxHeight: 420, objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://placehold.co/1200x420?text=Fiesta';
              }}
            />
            <Carousel.Caption className="bg-dark bg-opacity-50 rounded p-3">
              <h3 className="mb-1">{s.title}</h3>
              <p className="mb-3">{s.text}</p>
              <Button as={Link} to={s.cta.to} variant="primary">
                {s.cta.label}
              </Button>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* CATEGORÍAS DESTACADAS */}
      <section className="py-5">
        <Container>
          <header className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">Categorías destacadas</h2>
            <Button as={Link} to="/productos" variant="outline-secondary" size="sm">
              Ver todo
            </Button>
          </header>

          <Row className="g-4">
            {categoriasDestacadas.map((cat, i) => (
              <Col key={i} xs={12} sm={6} md={4} lg={3}>
                <Card className="h-100 shadow-sm">
                  <div style={{ height: 160, overflow: 'hidden' }}>
                    <Card.Img
                      variant="top"
                      src={cat.img}
                      alt={cat.title}
                      style={{ height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://placehold.co/600x400?text=Imagen';
                      }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h6">{cat.title}</Card.Title>
                    <Button
                      as={Link}
                      to={`/productos?search=${encodeURIComponent(cat.search)}`}
                      variant="primary"
                      className="mt-auto"
                    >
                      Ver productos
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="pb-5">
        <Container>
          <header className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">Productos destacados</h2>
            <Button as={Link} to="/productos" variant="outline-secondary" size="sm">
              Ir al catálogo
            </Button>
          </header>

          <Row className="g-4">
            {productosDestacados.map((p, i) => (
              <Col key={i} xs={12} sm={6} md={4} lg={3}>
                <Card className="h-100 shadow-sm">
                  <div style={{ height: 160, overflow: 'hidden' }}>
                    <Card.Img
                      variant="top"
                      src={p.img}
                      alt={p.title}
                      style={{ height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://placehold.co/600x400?text=Imagen';
                      }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h6 text-truncate" title={p.title}>
                      {p.title}
                    </Card.Title>
                    <div className="text-muted small mb-2">Desde {money.format(p.price)}</div>
                    <Button
                      as={Link}
                      to={`/productos?search=${encodeURIComponent(p.search)}`}
                      variant="outline-primary"
                      className="mt-auto"
                    >
                      Ver más
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </main>
  );
};

export default Home;
