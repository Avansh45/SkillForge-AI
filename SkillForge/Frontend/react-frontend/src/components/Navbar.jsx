// src/components/Navbar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Navbar = ({ items, activeSection, onSectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (targetKey) => {
    if (targetKey === 'settings') {
      navigate('/settings');
      setIsOpen(false);
      return;
    }
    onSectionChange(targetKey);
    setIsOpen(false);
  };

  return (
    <nav className="dash-nav">
<<<<<<< HEAD

=======
>>>>>>> TempBranch
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
<<<<<<< HEAD

=======
>>>>>>> TempBranch
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


=======
>>>>>>> TempBranch
    </nav>
  );
};

export default Navbar;
