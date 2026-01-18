// src/components/Navbar.jsx
import { useState } from 'react';

const Navbar = ({ items, activeSection, onSectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (targetKey) => {
    onSectionChange(targetKey);
    setIsOpen(false);
  };

  return (
    <nav className="dash-nav">
      <button
        type="button"
        className={`nav-toggle ${isOpen ? 'open' : ''}`}
        id="dashNavToggle"
        aria-controls="dashNavLinks"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>
      <ul id="dashNavLinks" className={isOpen ? 'open' : ''}>
        {items.map((item) => (
          <li key={item.key}>
            <a
              href="#"
              data-target={item.key}
              className={activeSection === item.key ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.key);
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;