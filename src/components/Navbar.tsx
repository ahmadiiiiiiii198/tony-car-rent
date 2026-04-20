import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

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
    setMobileOpen(false);
    document.body.style.overflow = 'unset';

    requestAnimationFrame(() => {
      const fleetSection = document.getElementById('fleet');
      if (fleetSection) {
        const top = fleetSection.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);

    // Explicitly unset overflow for immediate effect on mobile browsers
    document.body.style.overflow = 'unset';

    requestAnimationFrame(() => {
      if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.querySelector(href);
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  };

  return (
    <>
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
            <Menu size={24} />
          </button>
        </div>

      </nav>

      {/* Mobile Menu - rendered via portal to avoid navbar pointer-events: none */}
      {createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-menu-overlay"
            >
              <div className="mobile-menu-header">
                <a href="#" className="mobile-menu-logo" onClick={(e) => handleNavClick(e, '#')}>
                  <img src="/logo-newest.png" alt="Tonaydin Luxury Cars" />
                </a>
                <button
                  className="mobile-menu-close"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={32} />
                </button>
              </div>

              <div className="mobile-menu-content">
                <div className="mobile-links">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.id}
                      href={link.href}
                      className="mobile-link"
                      onClick={(e) => handleNavClick(e, link.href)}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </div>

                <motion.div
                  className="mobile-menu-footer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <button
                    className="lang-switcher mobile"
                    onClick={toggleLanguage}
                  >
                    <Globe size={20} />
                    <span>{language === 'it' ? 'ENGLISH' : 'ITALIANO'}</span>
                  </button>

                  <button className="btn-primary mobile-book-btn" onClick={scrollToFleet}>
                    {t.bookNow}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
