import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <img src="/logo-newest.png" alt="Tonaydin" style={{ height: '4rem', marginBottom: '1.5rem' }} />
                        <p>
                            {t.footerDesc}
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="social-link">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="social-link">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-heading">{t.quickLinks}</h4>
                        <ul className="footer-links">
                            <li><a href="#">{t.home}</a></li>
                            <li><a href="#fleet">{t.fleet}</a></li>
                            <li><a href="#services">{t.services}</a></li>
                            <li><a href="#about">{t.about}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-heading">{t.contactUs}</h4>
                        <ul className="footer-links">
                            <li className="contact-item">
                                <MapPin size={18} className="contact-icon" />
                                <span>Torino, Italia</span>
                            </li>
                            <li className="contact-item">
                                <Phone size={18} className="contact-icon" />
                                <div>
                                    <p>+39 351 048 4630</p>
                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>Lun-Sab, 9:00 - 19:00</p>
                                </div>
                            </li>
                            <li className="contact-item">
                                <Mail size={18} className="contact-icon" />
                                <span>info@tonaydinluxurycars.it</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Tonaydin Luxury Cars. {t.allRightsReserved}</p>
                    <div className="footer-legal">
                        <a href="#">{t.privacyPolicy}</a>
                        <a href="#">{t.termsConditions}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
