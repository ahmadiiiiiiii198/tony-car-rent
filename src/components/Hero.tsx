import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key, Car, Search, MapPin, Fuel, Calendar, Gauge,
    Send, User, Mail, Phone, MessageSquare, CheckCircle,
    Loader2, Shield, Clock, Award
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

type TabKey = 'sale' | 'rental' | 'perizia' | 'assistance';

import type { SearchParams } from '../types/SearchParams';

interface HeroProps {
    onSearch: (params: SearchParams) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabKey | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [dbBrands, setDbBrands] = useState<string[]>([]);
    const [allCars, setAllCars] = useState<{ brand: string, name: string }[]>([]);
    const [animationStage, setAnimationStage] = useState<'intro' | 'settling' | 'complete'>('intro');
    const [showPanels, setShowPanels] = useState(true);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const [currentPanelIndex, setCurrentPanelIndex] = useState(0);

    useEffect(() => {
        if (animationStage === 'intro') {
            const intervalTime = isMobile ? 1800 : 800; // Slightly faster for mobile but still readable
            const timer = setInterval(() => {
                setCurrentPanelIndex(prev => {
                    if (prev < features.length - 1) {
                        return prev + 1;
                    } else {
                        clearInterval(timer);

                        // Desktop settling phase
                        if (!isMobile) {
                            setTimeout(() => {
                                setAnimationStage('settling');
                                setTimeout(() => {
                                    setAnimationStage('complete');
                                    setShowPanels(false);
                                }, 1200);
                            }, 1000);
                        } else {
                            // Mobile sequence ends - wait for the last panel's full duration
                            setTimeout(() => {
                                setAnimationStage('complete');
                                setShowPanels(false);
                            }, 2500);
                        }
                        return prev;
                    }
                });
            }, intervalTime);
            return () => clearInterval(timer);
        }
    }, [animationStage, features.length, isMobile]);

    // Search State
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedFuel, setSelectedFuel] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [requestName, setRequestName] = useState('');
    const [requestEmail, setRequestEmail] = useState('');
    const [requestPhone, setRequestPhone] = useState('');
    const [requestMessage, setRequestMessage] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 10,
                y: (e.clientY / window.innerHeight - 0.5) * 10
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const fetchFilters = async () => {
            const { data } = await supabase
                .from('cars')
                .select('brand, name');
            if (data) {
                setAllCars(data);
                const uniqueBrands = Array.from(new Set(data.map((c: any) => c.brand))).sort() as string[];
                setDbBrands(uniqueBrands);
            }
        };
        fetchFilters();
    }, []);

    const scrollToFleet = () => {
        const fleetSection = document.getElementById('fleet');
        if (fleetSection) {
            fleetSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleTabClick = (tabKey: TabKey) => {
        const newTab = activeTab === tabKey ? null : tabKey;
        setActiveTab(newTab);
        setSelectedBrand('');
        setSelectedModel('');
        setSelectedFuel('');
        setPriceMin('');
        setPriceMax('');

        const params: SearchParams = {
            brand: '',
            model: '',
            fuel: '',
            minPrice: 0,
            maxPrice: 0,
            listingType: 'all',
            category: ''
        };

        if (newTab === 'sale') params.listingType = 'sale';
        else if (newTab === 'rental') params.listingType = 'rental';
        else if (newTab === 'assistance') params.listingType = 'both';

        onSearch(params);

        if (isMobile && newTab !== null) {
            setTimeout(() => {
                scrollToFleet();
            }, 300);
        }
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestName || !requestEmail || !requestPhone) return;
        setRequestLoading(true);

        let requestType = 'Richiesta Generale';
        let brandLabel = 'Generale';

        if (activeTab === 'perizia') {
            requestType = 'Richiesta Perizia / Valutazione';
            brandLabel = 'Perizia';
        } else if (activeTab === 'assistance') {
            requestType = 'Richiesta Assistenza Stradale';
            brandLabel = 'Assistenza';
        }

        const { error } = await supabase.from('orders').insert({
            car_id: null,
            car_name: requestType,
            car_brand: brandLabel,
            customer_name: requestName,
            customer_email: requestEmail,
            customer_phone: requestPhone,
            order_type: 'info',
            message: requestMessage || null,
            status: 'pending'
        });
        setRequestLoading(false);
        if (!error) setRequestSuccess(true);
    };

    const handleSearch = () => {
        let listingType: 'all' | 'sale' | 'rental' | 'both' = 'all';
        let category = '';

        if (activeTab === 'sale') listingType = 'sale';
        else if (activeTab === 'rental') listingType = 'rental';

        const fuelMap: Record<string, string> = {
            'petrol': 'Benzina',
            'diesel': 'Diesel',
            'hybrid': 'Hybrid',
            'lpg': 'Benzina GPL',
            'cng': 'Metano',
            'electric': 'Elettrica'
        };

        const mappedFuel = selectedFuel ? (fuelMap[selectedFuel] || selectedFuel) : '';

        onSearch({
            brand: selectedBrand,
            model: selectedModel,
            fuel: mappedFuel,
            minPrice: Number(priceMin) || 0,
            maxPrice: Number(priceMax) || 0,
            listingType,
            category
        });

        scrollToFleet();
    };

    const availableModels = selectedBrand
        ? Array.from(new Set(allCars.filter(c => c.brand === selectedBrand).map(c => c.name))).sort()
        : [];

    const tabs: { key: TabKey; label: string; icon: React.ReactNode; description: string; badge?: string }[] = [
        { key: 'sale', label: t.tabUsedCars, icon: <Car size={18} />, description: t.usedCarsDesc },
        { key: 'rental', label: t.tabRental, icon: <Key size={18} />, description: t.rentalDesc },
        { key: 'perizia', label: t.tabPerizia, icon: <Award size={18} />, description: t.periziaDesc, badge: t.tabNovita },
        { key: 'assistance', label: t.tabAssistance, icon: <Phone size={18} />, description: t.assistanceDesc },
    ];

    const currentTab = tabs.find(tab => tab.key === activeTab);
    const currentBrands = dbBrands.length > 0 ? dbBrands : [
        'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'Citroën', 'Ferrari', 'Fiat',
        'Ford', 'Lamborghini', 'Lancia', 'Land Rover', 'Maserati', 'McLaren',
        'Mercedes-Benz', 'Nissan', 'Peugeot', 'Porsche', 'Smart', 'Toyota', 'Volkswagen'
    ];


    const panelVariants: any = {
        hidden: { opacity: 0, scale: 0.8, y: 30 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: -100,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <section className="hero-section" id="home">
            <motion.div
                className="hero-bg"
                style={{ scale: 1.1 }}
                animate={{
                    x: mousePosition.x * -1,
                    y: mousePosition.y * -1
                }}
                transition={{ type: "tween", ease: "linear", duration: 0.2 }}
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/hero.png"
                >
                    <source src="/bmw.mp4" type="video/mp4" />
                </video>
                <div className="hero-overlay" />
            </motion.div>

            <div className="container hero-content">
                {/* Panels Animation Stage */}
                <div className={`hero-panels-container ${isMobile ? 'mobile-sequential' : ''}`}>
                    {isMobile ? (
                        <AnimatePresence mode="wait">
                            {features.map((feature, index) => (
                                index === currentPanelIndex && showPanels && (
                                    <motion.div
                                        key={`mobile-panel-${index}`}
                                        className="hero-animated-panel"
                                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{
                                            opacity: 0,
                                            scale: 1.1,
                                            y: -30,
                                            filter: "blur(15px)",
                                            transition: { duration: 0.5 }
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                    >
                                        <div className="service-icon">
                                            {feature.icon}
                                        </div>
                                        <h3 className="service-title">{feature.title}</h3>
                                        <p className="service-desc">{feature.description}</p>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    ) : (
                        <AnimatePresence>
                            {showPanels && features.map((feature, index) => (
                                index <= currentPanelIndex && (
                                    <motion.div
                                        key={`desktop-panel-${index}`}
                                        layout
                                        className="hero-animated-panel"
                                        variants={panelVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <div className="service-icon">
                                            {feature.icon}
                                        </div>
                                        <h3 className="service-title">{feature.title}</h3>
                                        <p className="service-desc">{feature.description}</p>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Search widget with category tabs */}
                <motion.div
                    className="hero-search-widget"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                        opacity: animationStage === 'complete' ? 1 : 0,
                        y: animationStage === 'complete' ? (isMobile ? 0 : -80) : 50,
                        pointerEvents: (animationStage === 'complete' || animationStage === 'settling') ? 'auto' : 'none'
                    }}
                    transition={{
                        delay: animationStage === 'complete' ? 0.6 : 0,
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                >
                    <div className="hero-tabs">
                        {tabs.map((tab, index) => (
                            <motion.button
                                key={tab.key}
                                className={`hero-tab ${activeTab === tab.key ? 'active' : ''} ${tab.badge ? 'has-badge' : ''}`}
                                onClick={() => handleTabClick(tab.key)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: animationStage === 'complete' ? 1.2 + index * 0.1 : 0,
                                    duration: 0.5,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                whileHover={{ y: -2, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="hero-tab-icon">{tab.icon}</span>
                                <span className="hero-tab-label">{tab.label}</span>
                                {tab.badge && (
                                    <span className="hero-tab-badge">{tab.badge}</span>
                                )}
                                {activeTab === tab.key && (
                                    <motion.div
                                        className="hero-tab-indicator"
                                        layoutId="heroTabIndicator"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>

                    <div className="hero-panel">
                        <AnimatePresence mode="wait">
                            {!activeTab && (
                                <motion.div
                                    key="default"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="hero-panel-default"
                                >
                                    <p>{t.selectCategoryToStart}</p>
                                </motion.div>
                            )}
                            {activeTab && (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="hero-panel-inner">
                                        <p className="hero-panel-desc">{currentTab?.description}</p>

                                        {(activeTab === 'perizia' || activeTab === 'assistance') ? (
                                            requestSuccess ? (
                                                <div className="hero-request-success">
                                                    <CheckCircle size={48} />
                                                    <h4>{language === 'it' ? 'Richiesta Inviata!' : 'Request Sent!'}</h4>
                                                    <p>{language === 'it' ? 'Ti contatteremo al più presto.' : 'We will contact you soon.'}</p>
                                                    <button
                                                        className="hero-search-btn"
                                                        style={{ marginTop: '1rem' }}
                                                        onClick={() => {
                                                            setRequestSuccess(false);
                                                            setRequestName('');
                                                            setRequestEmail('');
                                                            setRequestPhone('');
                                                            setRequestMessage('');
                                                        }}
                                                    >
                                                        {language === 'it' ? 'Nuova Richiesta' : 'New Request'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <form className="hero-request-form" onSubmit={handleRequestSubmit}>
                                                    <div className="hero-request-row">
                                                        <div className="hero-request-field">
                                                            <User size={18} />
                                                            <input
                                                                type="text"
                                                                placeholder={t.namePlaceholder}
                                                                value={requestName}
                                                                onChange={(e) => setRequestName(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="hero-request-field">
                                                            <Mail size={18} />
                                                            <input
                                                                type="email"
                                                                placeholder={t.emailPlaceholder}
                                                                value={requestEmail}
                                                                onChange={(e) => setRequestEmail(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="hero-request-row">
                                                        <div className="hero-request-field">
                                                            <Phone size={18} />
                                                            <input
                                                                type="tel"
                                                                placeholder={t.phonePlaceholder}
                                                                value={requestPhone}
                                                                onChange={(e) => setRequestPhone(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="hero-request-field hero-request-message">
                                                            <MessageSquare size={18} />
                                                            <input
                                                                type="text"
                                                                placeholder={t.messagePlaceholder}
                                                                value={requestMessage}
                                                                onChange={(e) => setRequestMessage(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        type="submit"
                                                        className="hero-request-submit"
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        disabled={requestLoading}
                                                    >
                                                        {requestLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                                        {language === 'it' ? 'Invia Richiesta' : 'Send Request'}
                                                    </motion.button>
                                                </form>
                                            )
                                        ) : (
                                            <div className="hero-search-form">

                                                <div className="hero-search-row">
                                                    <label className="hero-search-field">
                                                        <span className="field-label"><Car size={14} /> {t.searchBrand}</span>
                                                        <select
                                                            value={selectedBrand}
                                                            onChange={(e) => {
                                                                setSelectedBrand(e.target.value);
                                                                setSelectedModel('');
                                                            }}
                                                        >
                                                            <option value="">{t.searchAllBrands}</option>
                                                            {currentBrands.map(brand => (
                                                                <option key={brand} value={brand}>{brand}</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <label className="hero-search-field">
                                                        <span className="field-label"><Car size={14} /> {t.searchModel}</span>
                                                        <select
                                                            value={selectedModel}
                                                            onChange={(e) => setSelectedModel(e.target.value)}
                                                            disabled={!selectedBrand}
                                                        >
                                                            <option value="">{t.searchAllModels}</option>
                                                            {availableModels.map(model => (
                                                                <option key={model} value={model}>{model}</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <label className="hero-search-field">
                                                        <span className="field-label"><Fuel size={14} /> {t.searchFuel}</span>
                                                        <select
                                                            value={selectedFuel}
                                                            onChange={(e) => setSelectedFuel(e.target.value)}
                                                        >
                                                            <option value="">{t.searchAllFuels}</option>
                                                            <option value="petrol">{t.fuelPetrol}</option>
                                                            <option value="diesel">{t.fuelDiesel}</option>
                                                            <option value="hybrid">{t.fuelHybrid}</option>
                                                            <option value="electric">{t.fuelElectric}</option>
                                                            <option value="lpg">{t.fuelLPG}</option>
                                                            <option value="cng">{t.fuelCNG}</option>
                                                        </select>
                                                    </label>
                                                </div>
                                                <div className="hero-search-row">
                                                    <label className="hero-search-field hero-search-field-half">
                                                        <span className="field-label">{t.searchPriceFrom}</span>
                                                        <input
                                                            type="number"
                                                            placeholder="€ Min"
                                                            value={priceMin}
                                                            onChange={(e) => setPriceMin(e.target.value)}
                                                        />
                                                    </label>
                                                    <label className="hero-search-field hero-search-field-half">
                                                        <span className="field-label">{t.searchPriceTo}</span>
                                                        <input
                                                            type="number"
                                                            placeholder="€ Max"
                                                            value={priceMax}
                                                            onChange={(e) => setPriceMax(e.target.value)}
                                                        />
                                                    </label>
                                                    {activeTab !== 'rental' && (
                                                        <>
                                                            <label className="hero-search-field hero-search-field-half">
                                                                <span className="field-label"><Calendar size={14} /> {t.searchYearFrom}</span>
                                                                <input type="number" placeholder="2015" min="1990" max="2026" />
                                                            </label>
                                                            <label className="hero-search-field hero-search-field-half">
                                                                <span className="field-label"><Gauge size={14} /> {t.searchMileageMax}</span>
                                                                <input type="number" placeholder="150.000 km" />
                                                            </label>
                                                        </>
                                                    )}
                                                    {activeTab === 'rental' && (
                                                        <>
                                                            <label className="hero-search-field hero-search-field-half">
                                                                <span className="field-label"><Calendar size={14} /> {t.pickupDate}</span>
                                                                <input type="date" />
                                                            </label>
                                                            <label className="hero-search-field hero-search-field-half">
                                                                <span className="field-label"><Calendar size={14} /> {t.returnDate}</span>
                                                                <input type="date" />
                                                            </label>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="hero-search-actions">
                                                    <motion.button
                                                        className="hero-search-btn"
                                                        whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(212,175,55,0.4)" }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={handleSearch}
                                                    >
                                                        <Search size={18} />
                                                        {t.searchButton}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
