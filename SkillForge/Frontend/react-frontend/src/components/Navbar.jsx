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
        className="nav-toggle"
        id="dashNavToggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
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