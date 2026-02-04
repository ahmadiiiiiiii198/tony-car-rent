import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.home, href: '#' },
    { name: t.fleet, href: '#fleet' },
    { name: t.services, href: '#services' },
    { name: t.contact, href: '#contact' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'it' ? 'en' : 'it');
  };

  const scrollToFleet = () => {
    const fleetSection = document.getElementById('fleet');
    if (fleetSection) {
      fleetSection.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
    >
      <div className="container nav-content">
        <a href="#" className="nav-logo" onClick={(e) => handleNavClick(e, '#')}>
          <img src="/logo-newest.png" alt="Tonaydin Luxury Cars" />
        </a>

        {/* Desktop Menu */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="nav-link"
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.name}
            </a>
          ))}

          {/* Language Switcher */}
          <button
            className="lang-switcher"
            onClick={toggleLanguage}
            title={language === 'it' ? 'Switch to English' : 'Cambia in Italiano'}
          >
            <Globe size={18} />
            <span>{language.toUpperCase()}</span>
          </button>

          <button className="btn-outline" onClick={scrollToFleet}>
            {t.bookNow}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-menu"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="mobile-link"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.name}
              </a>
            ))}

            {/* Mobile Language Switcher */}
            <button
              className="lang-switcher mobile"
              onClick={toggleLanguage}
            >
              <Globe size={18} />
              <span>{language === 'it' ? 'English' : 'Italiano'}</span>
            </button>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={scrollToFleet}>
              {t.bookNow}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
