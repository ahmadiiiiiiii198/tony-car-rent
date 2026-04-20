import { Instagram, Facebook, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

export const Footer = () => {
    const { t } = useLanguage();
    const { settings } = useSettings();

    return (
        <footer className="footer" id="contact" role="contentinfo" aria-label="Contatti e informazioni Tonaydin Luxury Cars">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <img src="/logo-newest.png" alt="Tonaydin" style={{ height: '4rem', marginBottom: '1.5rem' }} />
                        <p>
                            {t.footerDesc}
                        </p>
                        <div className="social-links">
                            <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Seguici su Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href={`https://wa.me/${settings.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Contattaci su WhatsApp">
                                <MessageCircle size={20} />
                            </a>
                            <a href="#" className="social-link" aria-label="Seguici su Facebook">
                                <Facebook size={20} />
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
                                <span>{settings.address}</span>
                            </li>
                            <li className="contact-item">
                                <Phone size={18} className="contact-icon" />
                                <div>
                                    <p>{settings.phone}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>Lun-Sab, 9:00 - 19:00</p>
                                </div>
                            </li>
                            <li className="contact-item">
                                <Mail size={18} className="contact-icon" />
                                <span>{settings.email}</span>
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
