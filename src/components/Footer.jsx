// src/components/Footer.jsx
import { Container } from 'react-bootstrap';

const Footer = () => (
  <footer className="bg-dark text-white py-3 mt-4" role="contentinfo">
    <Container className="text-center">
      © {new Date().getFullYear()} Cotillón
    </Container>
  </footer>
);

export default Footer;
