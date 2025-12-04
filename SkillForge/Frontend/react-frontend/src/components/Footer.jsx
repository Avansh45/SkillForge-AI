// src/components/Footer.jsx

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="premium-footer">
      <span>© {currentYear} SkillForge. All rights reserved.</span>
    </footer>
  );
};

export default Footer;