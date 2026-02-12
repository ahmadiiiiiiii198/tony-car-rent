import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Scroll Spy Logic
      const sections = ['home', 'fleet', 'services', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', name: t.home, href: '#' },
    { id: 'fleet', name: t.fleet, href: '#fleet' },
    { id: 'services', name: t.services, href: '#services' },
    { id: 'contact', name: t.contact, href: '#contact' },
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
              key={link.id}
              href={link.href}
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
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
