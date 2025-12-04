// src/components/Header.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onLoginClick, onSignupClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (sectionId) => {
    setIsMenuOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header>
      <div className="container">
        <nav className="nav">
          <div className="nav-left">
            <div className="logo-circle">S</div>
            <div className="brand-text">
              <span>SkillForge</span>
              <span>AI-Driven Adaptive Learning</span>
            </div>
          </div>

          <div className={`nav-links ${isMenuOpen ? 'open' : ''}`} id="navLinks">
            <a href="#home" onClick={() => handleNavClick('home')}>Home</a>
            <a href="#about" onClick={() => handleNavClick('about')}>About</a>
            <a href="#features" onClick={() => handleNavClick('features')}>Features</a>
            <a href="#courses" onClick={() => handleNavClick('courses')}>Courses</a>
            <a href="#ai" onClick={() => handleNavClick('ai')}>AI Engine</a>
            <a href="#contact" onClick={() => handleNavClick('contact')}>Contact</a>

            {/* Mobile only auth buttons */}
            <div className="nav-auth-mobile">
              <button className="btn btn-outline" onClick={onLoginClick}>
                Login
              </button>
              <button className="btn btn-primary" onClick={onSignupClick}>
                Sign Up
              </button>
            </div>
          </div>

          <div className="nav-auth nav-auth-desktop">
            <button className="btn btn-outline" onClick={onLoginClick}>
              Login
            </button>
            <button className="btn btn-primary" onClick={onSignupClick}>
              Sign Up
            </button>
          </div>

          <button className="nav-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;