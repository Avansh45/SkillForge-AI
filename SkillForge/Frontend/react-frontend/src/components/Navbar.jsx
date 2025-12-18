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
<<<<<<< HEAD
=======
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
>>>>>>> aacea16 (Merge TempBranch changes)
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
<<<<<<< HEAD
      <button
        className="nav-toggle"
        id="dashNavToggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
=======
>>>>>>> aacea16 (Merge TempBranch changes)
    </nav>
  );
};

export default Navbar;