// src/components/SearchBar.jsx
import { Form, InputGroup } from 'react-bootstrap';

const SearchBar = ({ value, onChange, placeholder = 'Buscar…', ariaLabel = 'Buscar', className = '' }) => {
  return (
    <InputGroup className={`mb-3 search-bar ${className}`}>
      <InputGroup.Text aria-hidden="true">🔍</InputGroup.Text>
      <Form.Control
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
    </InputGroup>
  );
};

export default SearchBar;
