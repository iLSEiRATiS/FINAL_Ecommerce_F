// src/components/Layout.jsx
import { Container } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => (
  <>
    <Header />
    <Container as="main" className="my-4" role="main">
      {children}
    </Container>
    <Footer />
  </>
);

export default Layout;
