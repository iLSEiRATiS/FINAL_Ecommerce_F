// src/components/SearchBar.jsx
import { InputGroup, Form, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ value, onChange, placeholder = 'Buscar…', ariaLabel = 'Buscar' }) {
  return (
    <InputGroup>
      <Form.Control
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
      <Button onClick={() => {}} className="btn-search-accent">
        <FaSearch />
      </Button>
    </InputGroup>
  );
}
