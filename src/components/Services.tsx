import { Shield, Clock, MapPin, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, bounce: 0.4, duration: 0.8 }
    }
};

export const Services = () => {
    const { language } = useLanguage();

    const features = [
        {
            icon: <Shield size={32} />,
            title: language === 'it' ? 'Assicurazione Premium' : 'Premium Insurance',
            description: language === 'it'
                ? 'Copertura completa per la tua tranquillità mentre guidi.'
                : 'Comprehensive coverage for your peace of mind while you drive.',
        },
        {
            icon: <Clock size={32} />,
            title: language === 'it' ? 'Supporto 24/7' : '24/7 Support',
            description: language === 'it'
                ? 'Servizio concierge sempre disponibile per assisterti in qualsiasi momento.'
                : 'Round-the-clock concierge service to assist you at any time.',
        },
        {
            icon: <MapPin size={32} />,
            title: language === 'it' ? 'Consegna a Domicilio' : 'Doorstep Delivery',
            description: language === 'it'
                ? 'Portiamo l\'auto direttamente da te, con il pieno e pronta all\'uso.'
                : 'We bring the car to your location, fully fueled and ready.',
        },
        {
            icon: <Award size={32} />,
            title: language === 'it' ? 'Miglior Prezzo Garantito' : 'Best Price Guarantee',
            description: language === 'it'
                ? 'Tariffe competitive per i veicoli più esclusivi sul mercato.'
                : 'Competitive rates for the most exclusive vehicles on the market.',
        },
    ];

    return (
        <section id="services" className="section-padding services-section">
            <div className="container">
                <div className="services-header">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ fontSize: '2.5rem', marginBottom: '1rem' }}
                    >
                        {language === 'it' ? 'Perché Scegliere' : 'Why Choose'} <span className="text-gold">Tonaydin</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        {language === 'it'
                            ? 'Eccellenza in ogni dettaglio del tuo viaggio.'
                            : 'Excellence in every detail of your journey.'}
                    </motion.p>
                </div>

                <div className="services-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="service-card"
                            variants={cardVariants}
                            initial="offscreen"
                            whileInView="onscreen"
                            viewport={{ once: true, amount: 0.2 }}
                            custom={index}
                        >
                            <div className="service-icon">
                                {feature.icon}
                            </div>
                            <h3 className="service-title">{feature.title}</h3>
                            <p className="service-desc">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
