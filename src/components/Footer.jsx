// src/components/Footer.jsx
<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaInstagram, FaEnvelope, FaPhoneAlt, FaArrowUp } from 'react-icons/fa';

const Footer = () => {
  const year = new Date().getFullYear();
  const [showTop, setShowTop] = useState(false);

  // Mostrar/ocultar botón "subir" según el scroll
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200);
    onScroll(); // estado inicial
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <footer className="bg-dark text-white mt-4 pt-3" role="contentinfo">
        <Container>
          <Row className="gy-3 align-items-start">
            {/* Marca (texto breve) */}
            <Col md={5}>
              <h6 className="mb-1">CotiStore</h6>
              <p className="mb-0 small text-white-50">
                Mayorista de cotillón y artículos para eventos. Calidad y buen precio.
              </p>
            </Col>

            {/* Contacto */}
            <Col md={4}>
              <h6 className="mb-1">Contacto</h6>
              <ul className="list-unstyled mb-0 small">
                <li className="d-flex align-items-center">
                  <FaEnvelope className="me-2" aria-hidden />
                  <a
                    href="mailto:ventascotistore@gmail.com"
                    className="link-light text-decoration-none"
                  >
                    ventascotistore@gmail.com
                  </a>
                </li>
                <li className="d-flex align-items-center mt-2">
                  <FaPhoneAlt className="me-2" aria-hidden />
                  <a href="tel:+541139581816" className="link-light text-decoration-none">
                    11 3958-1816
                  </a>
                </li>
              </ul>
            </Col>

            {/* Redes */}
            <Col md={3}>
              <h6 className="mb-1">Redes</h6>
              <a
                href="https://www.instagram.com/cotistore_mayorista"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light btn-sm d-inline-flex align-items-center"
                aria-label="Instagram de CotiStore (se abre en una pestaña nueva)"
              >
                <FaInstagram className="me-2" aria-hidden />
                @cotistore_mayorista
              </a>
            </Col>
          </Row>

          <hr className="border-secondary my-3" />

          <div className="d-flex justify-content-center align-items-center pb-2">
            <small className="text-white-50">
              © {year} CotiStore — Todos los derechos reservados.
            </small>
          </div>
        </Container>
      </footer>

      {/* Botón flotante: Subir al inicio */}
      {showTop && (
        <button
          type="button"
          onClick={scrollTop}
          aria-label="Subir al inicio"
          className="btn btn-primary shadow position-fixed"
          style={{
            right: 16,
            bottom: 16,
            borderRadius: '9999px',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
        >
          <FaArrowUp />
        </button>
      )}
    </>
  );
};
=======
import { Container } from 'react-bootstrap';

const Footer = () => (
  <footer className="bg-dark text-white py-3 mt-4" role="contentinfo">
    <Container className="text-center">
      © {new Date().getFullYear()} Cotillón
    </Container>
  </footer>
);
>>>>>>> origin/main

export default Footer;
