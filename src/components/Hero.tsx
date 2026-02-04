import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Hero = () => {
    const { t } = useLanguage();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const scrollToFleet = () => {
        const fleetSection = document.getElementById('fleet');
        if (fleetSection) {
            fleetSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero-section">
            <motion.div
                className="hero-bg"
                style={{ y: y1, scale: 1.1 }}
                animate={{
                    x: mousePosition.x * -1,
                    y: mousePosition.y * -1
                }}
                transition={{ type: "tween", ease: "linear", duration: 0.2 }}
            >
                <img
                    src="/hero.png"
                    alt="Luxury Car Background"
                />
                <div className="hero-overlay" />
            </motion.div>

            <div className="container hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ maxWidth: '900px', opacity }}
                >
                    <h1 className="hero-title">
                        <span className="block overflow-hidden">
                            <motion.span
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="block"
                            >
                                {t.driveThe}
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden text-gradient-gold">
                            <motion.span
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="block"
                            >
                                {t.extraordinary}
                            </motion.span>
                        </span>
                    </h1>

                    <motion.p
                        className="hero-desc"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                    >
                        {t.heroDesc}
                    </motion.p>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                            onClick={scrollToFleet}
                        >
                            {t.exploreFleet}
                            <ChevronRight size={20} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1, color: 'var(--color-gold)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={scrollToFleet}
                            style={{
                                width: '3.5rem',
                                height: '3.5rem',
                                borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                backdropFilter: 'blur(5px)'
                            }}
                        >
                            <Play size={20} fill="currentColor" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
