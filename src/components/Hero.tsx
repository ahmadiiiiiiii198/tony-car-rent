import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Car, Search, Truck, MapPin, Fuel, Calendar, Gauge } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

type TabKey = 'usedCars' | 'rental' | 'commercial' | 'onTheRoad';

import type { SearchParams } from '../types/SearchParams';

interface HeroProps {
    onSearch: (params: SearchParams) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabKey | null>('usedCars');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [dbBrands, setDbBrands] = useState<string[]>([]);
    const [allCars, setAllCars] = useState<{ brand: string, name: string }[]>([]);

    // Search State
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedFuel, setSelectedFuel] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');

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

    const handleSearch = () => {
        let listingType: 'all' | 'sale' | 'rental' | 'both' = 'all';
        let category = '';

        if (activeTab === 'usedCars') listingType = 'sale';
        else if (activeTab === 'rental') listingType = 'rental';
        else if (activeTab === 'commercial') {
            category = 'Van';
        }

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

    const tabs: { key: TabKey; label: string; icon: React.ReactNode; description: string }[] = [
        { key: 'usedCars', label: t.tabUsedCars, icon: <Car size={18} />, description: t.usedCarsDesc },
        { key: 'rental', label: t.tabRental, icon: <Key size={18} />, description: t.rentalDesc },
        { key: 'commercial', label: t.tabCommercial, icon: <Truck size={18} />, description: t.commercialDesc },
        { key: 'onTheRoad', label: t.tabOnTheRoad, icon: <MapPin size={18} />, description: t.onTheRoadDesc },
    ];

    const currentTab = tabs.find(tab => tab.key === activeTab);
    const currentBrands = dbBrands.length > 0 ? dbBrands : [
        'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'Citroën', 'Ferrari', 'Fiat',
        'Ford', 'Lamborghini', 'Lancia', 'Land Rover', 'Maserati', 'McLaren',
        'Mercedes-Benz', 'Nissan', 'Peugeot', 'Porsche', 'Smart', 'Toyota', 'Volkswagen'
    ];



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
                <motion.div
                    className="hero-search-widget"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Tabs */}
                    <div className="hero-tabs">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.key}
                                className={`hero-tab ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(activeTab === tab.key ? null : tab.key)}
                                whileHover={{ y: -2, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="hero-tab-icon">{tab.icon}</span>
                                <span className="hero-tab-label">{tab.label}</span>
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

                    {/* Panels */}
                    <div className="hero-panel">
                        <AnimatePresence mode="wait">
                            {activeTab && (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div style={{ padding: '2rem' }}>
                                        {/* Description */}
                                        <p className="hero-panel-desc">{currentTab?.description}</p>

                                        {/* Commercial subtypes badges */}
                                        {activeTab === 'commercial' && (
                                            <div className="hero-commercial-badges">
                                                {[
                                                    { icon: <Truck size={14} />, label: t.commercialTrucks },
                                                    { icon: <Car size={14} />, label: t.commercialVans },
                                                    { icon: <Car size={14} />, label: t.commercialMinibuses },
                                                    { icon: <Car size={14} />, label: t.commercialMinivans },
                                                ].map((badge, i) => (
                                                    <motion.span
                                                        key={badge.label}
                                                        className="commercial-badge"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.08 }}
                                                    >
                                                        {badge.icon}
                                                        {badge.label}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Search Form */}
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
