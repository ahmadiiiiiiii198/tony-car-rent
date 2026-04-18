import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key, Car, Search, MapPin, Calendar, Gauge,
    Send, User, Mail, Phone, MessageSquare, CheckCircle,
    Loader2, Shield, Award, ChevronDown, Fuel, Sliders, Palette, Check, Leaf, Info, Armchair, Wrench, Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import { PeriziaTable } from './PeriziaTable';
import { type SearchParams } from '../types/SearchParams';

type TabKey = 'sale' | 'rental' | 'perizia' | 'recambi' | 'importazione' | 'assistance';



interface HeroProps {
    onSearch: (params: SearchParams) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabKey | null>('sale');

    const [dbBrands, setDbBrands] = useState<string[]>([]);
    const [allCars, setAllCars] = useState<{ brand: string, name: string }[]>([]);
    const [animationStage] = useState<'intro' | 'settling' | 'complete'>('complete');

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    const priceOptions = Array.from({ length: 20 }, (_, i) => (i + 1) * 5000);
    const yearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
    const mileageOptions = [5000, 10000, 20000, 30000, 40000, 50000, 60000, 75000, 100000, 125000, 150000, 175000, 200000];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);



    // Search State
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');

    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [yearMin, setYearMin] = useState('');
    const [mileageMax, setMileageMax] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    const [requestName, setRequestName] = useState('');
    const [requestEmail, setRequestEmail] = useState('');
    const [requestPhone, setRequestPhone] = useState('');
    const [requestMessage, setRequestMessage] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [requestTarga, setRequestTarga] = useState('');

    // Assistance (Pronto Interventi) fields
    const [assistanceFromAddress, setAssistanceFromAddress] = useState('');
    const [assistanceFromCity, setAssistanceFromCity] = useState('');
    const [assistanceToAddress, setAssistanceToAddress] = useState('');
    const [assistanceToCity, setAssistanceToCity] = useState('');
    const [assistanceKm, setAssistanceKm] = useState('');
    const [assistanceDistanceLoading, setAssistanceDistanceLoading] = useState(false);
    const [assistanceDistanceError, setAssistanceDistanceError] = useState('');
    const [assistanceFromCityError, setAssistanceFromCityError] = useState(false);
    const [assistanceToCityError, setAssistanceToCityError] = useState(false);
    const assistanceFromRef = useRef<HTMLInputElement>(null);
    const assistanceToRef = useRef<HTMLInputElement>(null);
    const assistanceFromAutocomplete = useRef<any>(null);
    const assistanceToAutocomplete = useRef<any>(null);

    // Derived full addresses for API calls
    const assistanceFrom = [assistanceFromAddress, assistanceFromCity].filter(Boolean).join(', ');
    const assistanceTo = [assistanceToAddress, assistanceToCity].filter(Boolean).join(', ');

    // Advanced search fields
    const [bodyType, setBodyType] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [transmission, setTransmission] = useState('');
    const [powerMin, setPowerMin] = useState('');
    const [powerMax, setPowerMax] = useState('');
    const [yearMax, setYearMax] = useState('');
    const [mileageMin, setMileageMin] = useState('');
    const [doorsFilter, setDoorsFilter] = useState('');
    const [sellerType, setSellerType] = useState<'all' | 'dealer' | 'private'>('all');
    const [conditionFilters, setConditionFilters] = useState<string[]>([]);
    const [colorFilters, setColorFilters] = useState<string[]>([]);
    const [featureFilters, setFeatureFilters] = useState<string[]>([]);

    // New sections state (Interni, Ambiente, Altre info)
    const [interiorColorFilters, setInteriorColorFilters] = useState<string[]>([]);
    const [materialFilters, setMaterialFilters] = useState<string[]>([]);
    const [emissionClass, setEmissionClass] = useState('');
    const [ecoBadge, setEcoBadge] = useState('');
    const [vatDeductible, setVatDeductible] = useState(false);

    // Collapsible sections state
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        main: false, advanced: false, specs: false, condition: false, features: false, colors: false, interior: false, ambiente: false, other: false
    });
    const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

    // Available dynamic options
    const [dbCategories, setDbCategories] = useState<string[]>([]);
    const [dbFuels, setDbFuels] = useState<string[]>([]);
    const [dbTransmissions, setDbTransmissions] = useState<string[]>([]);

    const messageInputRef = useRef<HTMLInputElement>(null);

    // Google Maps Autocomplete + Distance Matrix
    useEffect(() => {
        if (activeTab !== 'assistance') return;

        const initAutocomplete = () => {
            if (!(window as any).google?.maps?.places) return;

            if (assistanceFromRef.current && !assistanceFromAutocomplete.current) {
                assistanceFromAutocomplete.current = new (window as any).google.maps.places.Autocomplete(
                    assistanceFromRef.current,
                    { types: ['geocode'], componentRestrictions: { country: 'it' } }
                );
                assistanceFromAutocomplete.current.addListener('place_changed', () => {
                    const place = assistanceFromAutocomplete.current.getPlace();
                    if (place?.formatted_address) {
                        // Extract city from address components
                        const cityComponent = place.address_components?.find((c: any) =>
                            c.types.includes('locality') || c.types.includes('administrative_area_level_3')
                        );
                        const streetComponent = place.address_components?.find((c: any) =>
                            c.types.includes('route')
                        );
                        const streetNumber = place.address_components?.find((c: any) =>
                            c.types.includes('street_number')
                        );
                        const street = [streetComponent?.long_name, streetNumber?.long_name].filter(Boolean).join(' ');
                        setAssistanceFromAddress(street || place.formatted_address);
                        if (cityComponent) setAssistanceFromCity(cityComponent.long_name);
                    }
                });
            }

            if (assistanceToRef.current && !assistanceToAutocomplete.current) {
                assistanceToAutocomplete.current = new (window as any).google.maps.places.Autocomplete(
                    assistanceToRef.current,
                    { types: ['geocode'], componentRestrictions: { country: 'it' } }
                );
                assistanceToAutocomplete.current.addListener('place_changed', () => {
                    const place = assistanceToAutocomplete.current.getPlace();
                    if (place?.formatted_address) {
                        const cityComponent = place.address_components?.find((c: any) =>
                            c.types.includes('locality') || c.types.includes('administrative_area_level_3')
                        );
                        const streetComponent = place.address_components?.find((c: any) =>
                            c.types.includes('route')
                        );
                        const streetNumber = place.address_components?.find((c: any) =>
                            c.types.includes('street_number')
                        );
                        const street = [streetComponent?.long_name, streetNumber?.long_name].filter(Boolean).join(' ');
                        setAssistanceToAddress(street || place.formatted_address);
                        if (cityComponent) setAssistanceToCity(cityComponent.long_name);
                    }
                });
            }
        };

        // Wait for Google Maps to load if not ready yet
        if ((window as any).google?.maps?.places) {
            initAutocomplete();
        } else {
            const interval = setInterval(() => {
                if ((window as any).google?.maps?.places) {
                    clearInterval(interval);
                    initAutocomplete();
                }
            }, 300);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const calculateDistance = async () => {
        const fromCityOk = assistanceFromCity.trim().length > 0;
        const toCityOk = assistanceToCity.trim().length > 0;
        setAssistanceFromCityError(!fromCityOk);
        setAssistanceToCityError(!toCityOk);
        if (!fromCityOk || !toCityOk) {
            setAssistanceDistanceError(
                language === 'it'
                    ? 'Inserisci la città di partenza e di destinazione.'
                    : 'Please enter both the departure and destination city.'
            );
            return;
        }
        setAssistanceDistanceLoading(true);
        setAssistanceDistanceError('');
        setAssistanceKm('');

        try {
            const service = new (window as any).google.maps.DistanceMatrixService();
            service.getDistanceMatrix(
                {
                    origins: [assistanceFrom],
                    destinations: [assistanceTo],
                    travelMode: (window as any).google.maps.TravelMode.DRIVING,
                    unitSystem: (window as any).google.maps.UnitSystem.METRIC,
                },
                (response: any, status: string) => {
                    setAssistanceDistanceLoading(false);
                    if (status === 'OK') {
                        const element = response.rows[0]?.elements[0];
                        if (element?.status === 'OK') {
                            const km = Math.ceil(element.distance.value / 1000);
                            setAssistanceKm(String(km));
                        } else {
                            setAssistanceDistanceError(language === 'it' ? 'Percorso non trovato. Verifica gli indirizzi.' : 'Route not found. Check the addresses.');
                        }
                    } else {
                        setAssistanceDistanceError(language === 'it' ? 'Errore nel calcolo della distanza.' : 'Error calculating distance.');
                    }
                }
            );
        } catch {
            setAssistanceDistanceLoading(false);
            setAssistanceDistanceError(language === 'it' ? 'Errore nel calcolo della distanza.' : 'Error calculating distance.');
        }
    };



    useEffect(() => {
        const fetchFilters = async () => {
            const { data } = await supabase
                .from('cars')
                .select('brand, name, category, fuel, transmission');
            if (data) {
                setAllCars(data);
                const uniqueBrands = Array.from(new Set(data.map((c: any) => c.brand))).filter(Boolean).sort() as string[];
                setDbBrands(uniqueBrands);
                const uniqueCategories = Array.from(new Set(data.map((c: any) => c.category))).filter(Boolean).sort() as string[];
                setDbCategories(uniqueCategories);
                const uniqueFuels = Array.from(new Set(data.map((c: any) => c.fuel))).filter(Boolean).sort() as string[];
                setDbFuels(uniqueFuels);
                const uniqueTransmissions = Array.from(new Set(data.map((c: any) => c.transmission))).filter(Boolean).sort() as string[];
                setDbTransmissions(uniqueTransmissions);
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

        setPriceMin('');
        setPriceMax('');
        setYearMin('');
        setMileageMax('');
        setPickupDate('');
        setReturnDate('');

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
        else if (newTab === 'recambi') params.listingType = 'both';
        else if (newTab === 'importazione') params.listingType = 'all';
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
        if (!requestName || !requestPhone) return;
        if (activeTab !== 'recambi' && !requestEmail) return;
        setRequestLoading(true);

        let requestType = 'Richiesta Generale';
        let brandLabel = 'Generale';

        if (activeTab === 'perizia') {
            requestType = 'Richiesta Perizia / Valutazione';
            brandLabel = 'Perizia';
        } else if (activeTab === 'recambi') {
            requestType = 'Richiesta Ricambi';
            brandLabel = 'Ricambi';
        } else if (activeTab === 'importazione') {
            requestType = 'Richiesta Importazione Veicolo';
            brandLabel = 'Importazione';
        } else if (activeTab === 'assistance') {
            requestType = 'Richiesta Assistenza Stradale';
            brandLabel = 'Assistenza';
        }

        const fullMessage = activeTab === 'recambi' && requestTarga
            ? `[Targa: ${requestTarga}] ${requestMessage || ''}`
            : requestMessage || null;

        const { error } = await supabase.from('orders').insert({
            car_id: null,
            car_name: requestType,
            car_brand: brandLabel,
            customer_name: requestName,
            customer_email: requestEmail,
            customer_phone: requestPhone,
            order_type: 'info',
            message: fullMessage,
            status: 'pending'
        });
        setRequestLoading(false);
        if (!error) setRequestSuccess(true);
    };

    const handleSearch = () => {
        let listingType: 'all' | 'sale' | 'rental' | 'both' = 'all';

        if (activeTab === 'sale') listingType = 'sale';
        else if (activeTab === 'rental') listingType = 'rental';

        onSearch({
            brand: selectedBrand,
            model: selectedModel,
            fuel: fuelType,
            minPrice: Number(priceMin) || 0,
            maxPrice: Number(priceMax) || 0,
            year: Number(yearMin) || 0,
            km: Number(mileageMax) || 0,
            pickupDate,
            returnDate,
            listingType,
            category: bodyType,
            bodyType,
            transmission,
            powerMin: Number(powerMin) || 0,
            powerMax: Number(powerMax) || 0,
            doors: doorsFilter,
            sellerType,
            condition: conditionFilters as any,
            color: colorFilters,
            interiorColor: interiorColorFilters,
            interiorMaterial: materialFilters,
            features: featureFilters,
            fuelType: fuelType ? [fuelType] : [],
            emissionClass,
            ecoBadge,
            vatDeductible,
        });

        scrollToFleet();
    };

    const handleResetFilters = () => {
        setSelectedBrand(''); setSelectedModel('');
        setPriceMin(''); setPriceMax('');
        setYearMin(''); setYearMax('');
        setMileageMax(''); setMileageMin('');
        setBodyType(''); setFuelType(''); setTransmission('');
        setPowerMin(''); setPowerMax('');
        setDoorsFilter(''); setSellerType('all');
        setConditionFilters([]); setColorFilters([]); setFeatureFilters([]);
        setInteriorColorFilters([]); setMaterialFilters([]);
        setEmissionClass(''); setEcoBadge(''); setVatDeductible(false);
        setPickupDate(''); setReturnDate('');
    };

    const toggleCondition = (c: string) => {
        setConditionFilters(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };
    const toggleColor = (c: string) => {
        setColorFilters(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };
    const toggleFeature = (f: string) => {
        setFeatureFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
    };
    const toggleInteriorColor = (c: string) => {
        setInteriorColorFilters(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };
    const toggleMaterial = (m: string) => {
        setMaterialFilters(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
    };

    // Settings-driven data
    const { settings: siteSettings } = useSettings();
    const sfc = siteSettings.searchFormConfig;
    const exteriorColors = sfc?.exteriorColors || [];
    const interiorColors = sfc?.interiorColors || [];
    const allMaterials = sfc?.materials || [];
    const allFeatures = sfc?.features || [];
    const allConditions = sfc?.conditions || [];
    const doorOptions = sfc?.doorOptions || ['2/3', '4/5', '6/7'];
    const emissionClasses = sfc?.emissionClasses || [];
    const ecoBadgeLevels = sfc?.ecoBadgeLevels || [];

    const availableModels = selectedBrand
        ? Array.from(new Set(allCars.filter(c => c.brand === selectedBrand).map(c => c.name))).sort()
        : [];

    const tabs: { key: TabKey; label: string; icon: React.ReactNode; description: string; badge?: string }[] = [
        { key: 'sale', label: t.tabUsedCars, icon: <Car size={18} />, description: t.usedCarsDesc },
        { key: 'rental', label: t.tabRental, icon: <Key size={18} />, description: t.rentalDesc },
        { key: 'perizia', label: t.tabPerizia, icon: <Award size={18} />, description: t.periziaDesc, badge: t.tabNovita },
        { key: 'recambi', label: t.tabRecambi, icon: <Wrench size={18} />, description: t.recambiDesc },
        { key: 'importazione', label: t.tabImportazione, icon: <Globe size={18} />, description: t.importazioneDesc },
        { key: 'assistance', label: t.tabAssistance, icon: <Phone size={18} />, description: t.assistanceDesc },
    ];

    const currentTab = tabs.find(tab => tab.key === activeTab);
    const currentBrands = dbBrands.length > 0 ? dbBrands : [
        'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'Citroën', 'Ferrari', 'Fiat',
        'Ford', 'Lamborghini', 'Lancia', 'Land Rover', 'Maserati', 'McLaren',
        'Mercedes-Benz', 'Nissan', 'Peugeot', 'Porsche', 'Smart', 'Toyota', 'Volkswagen'
    ];
    return (
        <section className="hero-section" id="home">
            <div
                className="hero-bg"
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
                <div className={`hero-tab-overlay ${activeTab || ''}`} />
            </div>



            <div className="container hero-content">
                {/* Search widget with category tabs */}
                <motion.div
                    className={`hero-search-widget ${activeTab === 'perizia' ? 'is-perizia' : ''}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                        opacity: animationStage === 'complete' ? 1 : 0,
                        y: animationStage === 'complete' ? 0 : 50,
                        width: activeTab === 'perizia' && !isMobile ? '95%' : '100%',
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

                                        {activeTab === 'assistance' ? (
                                            <div className="assistance-pronto-layout">
                                                <div className="assistance-header">
                                                    <div className="assistance-title-row">
                                                        <Shield size={28} />
                                                        <h3>{language === 'it' ? 'Pronto Interventi' : 'Emergency Roadside'}</h3>
                                                    </div>
                                                    <div className="assistance-contacts" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                        <div className="assistance-numero-verde">
                                                            <Phone size={20} />
                                                            <div>
                                                                <span className="numero-verde-label">{language === 'it' ? 'Numero Verde' : 'Toll-Free'}</span>
                                                                <a href={`tel:${(siteSettings.assistancePhone || '800 123 456').replace(/\s/g, '')}`} className="numero-verde-number">
                                                                    {siteSettings.assistancePhone || '800 123 456'}
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="assistance-numero-verde mobile-contact">
                                                            <Phone size={20} />
                                                            <div>
                                                                <span className="numero-verde-label">{language === 'it' ? 'Cellulare 24/7' : '24/7 Mobile'}</span>
                                                                <a href={`tel:${(siteSettings.phone || '+39 329 116 3843').replace(/\s/g, '')}`} className="numero-verde-number">
                                                                    {siteSettings.phone || '+39 329 116 3843'}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="assistance-route-form">
                                                    <p className="assistance-route-label">{language === 'it' ? 'Calcola il preventivo del tuo trasporto' : 'Calculate your transport estimate'}</p>
                                                    <div className="assistance-route-fields">
                                                        {/* FROM */}
                                                        <div className="assistance-location-group">
                                                            <div className="assistance-location-label">
                                                                <MapPin size={14} />
                                                                {language === 'it' ? 'Partenza' : 'From'}
                                                            </div>
                                                            <div className="assistance-field">
                                                                <input
                                                                    ref={assistanceFromRef}
                                                                    type="text"
                                                                    placeholder={language === 'it' ? 'Indirizzo (es: Via Roma 1)' : 'Street address (e.g. 1 Main St)'}
                                                                    value={assistanceFromAddress}
                                                                    onChange={(e) => { setAssistanceFromAddress(e.target.value); setAssistanceKm(''); setAssistanceDistanceError(''); }}
                                                                />
                                                            </div>
                                                            <div className={`assistance-field city-field${assistanceFromCityError ? ' field-error' : ''}`}>
                                                                <input
                                                                    type="text"
                                                                    placeholder={language === 'it' ? 'Città *' : 'City *'}
                                                                    value={assistanceFromCity}
                                                                    onChange={(e) => { setAssistanceFromCity(e.target.value); setAssistanceKm(''); setAssistanceDistanceError(''); setAssistanceFromCityError(false); }}
                                                                />
                                                            </div>
                                                            {assistanceFromCityError && (
                                                                <p className="assistance-field-hint error">⚠ {language === 'it' ? 'La città è obbligatoria' : 'City is required'}</p>
                                                            )}
                                                        </div>

                                                        <div className="assistance-route-divider">
                                                            <div className="route-line" />
                                                            <ChevronDown size={16} />
                                                            <div className="route-line" />
                                                        </div>

                                                        {/* TO */}
                                                        <div className="assistance-location-group">
                                                            <div className="assistance-location-label">
                                                                <MapPin size={14} />
                                                                {language === 'it' ? 'Destinazione' : 'To'}
                                                            </div>
                                                            <div className="assistance-field">
                                                                <input
                                                                    ref={assistanceToRef}
                                                                    type="text"
                                                                    placeholder={language === 'it' ? 'Indirizzo (es: Via Garibaldi 5)' : 'Street address (e.g. 5 Garibaldi St)'}
                                                                    value={assistanceToAddress}
                                                                    onChange={(e) => { setAssistanceToAddress(e.target.value); setAssistanceKm(''); setAssistanceDistanceError(''); }}
                                                                />
                                                            </div>
                                                            <div className={`assistance-field city-field${assistanceToCityError ? ' field-error' : ''}`}>
                                                                <input
                                                                    type="text"
                                                                    placeholder={language === 'it' ? 'Città *' : 'City *'}
                                                                    value={assistanceToCity}
                                                                    onChange={(e) => { setAssistanceToCity(e.target.value); setAssistanceKm(''); setAssistanceDistanceError(''); setAssistanceToCityError(false); }}
                                                                />
                                                            </div>
                                                            {assistanceToCityError && (
                                                                <p className="assistance-field-hint error">⚠ {language === 'it' ? 'La città è obbligatoria' : 'City is required'}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="assistance-km-row">
                                                        <button
                                                            type="button"
                                                            className="assistance-calc-btn"
                                                            onClick={calculateDistance}
                                                            disabled={!assistanceFromCity.trim() || !assistanceToCity.trim() || assistanceDistanceLoading}
                                                        >
                                                            {assistanceDistanceLoading
                                                                ? <Loader2 size={18} className="animate-spin" />
                                                                : <Gauge size={18} />}
                                                            {language === 'it' ? 'Calcola Distanza' : 'Calculate Distance'}
                                                        </button>

                                                        {assistanceDistanceError && (
                                                            <div className="assistance-distance-error">
                                                                {assistanceDistanceError}
                                                            </div>
                                                        )}

                                                        {assistanceKm && Number(assistanceKm) > 0 && (
                                                            <div className="assistance-price-result">
                                                                <span className="price-label">{language === 'it' ? 'Distanza calcolata' : 'Calculated distance'}</span>
                                                                <span className="price-value">🗺 {assistanceKm} km</span>
                                                                <span className="price-label" style={{ marginTop: '0.5rem' }}>{language === 'it' ? 'Preventivo stimato' : 'Estimated price'}</span>
                                                                <span className="price-value">€ {(Number(assistanceKm) * (siteSettings.assistancePricePerKm || 2.5)).toFixed(2)}</span>
                                                                <span className="price-note">({`€${siteSettings.assistancePricePerKm || 2.5}/km`})</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <a
                                                        href={`https://wa.me/${(siteSettings.whatsapp || '393291163843').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                                            `Pronto Interventi - Richiesta Assistenza Stradale\n\nDa: ${assistanceFrom}\nA: ${assistanceTo}\nDistanza: ${assistanceKm} km\nPreventivo: €${(Number(assistanceKm || 0) * (siteSettings.assistancePricePerKm || 2.5)).toFixed(2)}`
                                                        )}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="assistance-cta-btn"
                                                    >
                                                        <Phone size={18} />
                                                        {language === 'it' ? 'Richiedi Assistenza' : 'Request Assistance'}
                                                    </a>
                                                </div>
                                            </div>
                                        ) : activeTab === 'recambi' ? (
                                            <div className="recambi-layout">
                                                <div className="recambi-info">
                                                    <div className="recambi-icon-row">
                                                        <Wrench size={28} />
                                                        <h3>{language === 'it' ? 'Ricambi Auto' : 'Car Spare Parts'}</h3>
                                                    </div>
                                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                                                        {language === 'it'
                                                            ? 'Forniamo ricambi originali e compatibili per tutte le marche. Compila il modulo con i dettagli del pezzo di cui hai bisogno e ti invieremo un preventivo rapidamente.'
                                                            : 'We supply original and compatible spare parts for all makes. Fill out the form with the details of the part you need and we\'ll send you a quote quickly.'}
                                                    </p>
                                                </div>
                                                <div className="recambi-form-section">
                                                    {requestSuccess ? (
                                                        <div className="hero-request-success">
                                                            <CheckCircle size={48} />
                                                            <h4>{language === 'it' ? 'Richiesta Inviata!' : 'Request Sent!'}</h4>
                                                            <p>{language === 'it' ? 'Ti contatteremo al più presto con il preventivo.' : 'We will contact you soon with the quote.'}</p>
                                                            <button
                                                                className="hero-search-btn"
                                                                style={{ marginTop: '1rem' }}
                                                                onClick={() => {
                                                                    setRequestSuccess(false);
                                                                    setRequestName('');
                                                                    setRequestEmail('');
                                                                    setRequestPhone('');
                                                                    setRequestMessage('');
                                                                    setRequestTarga('');
                                                                }}
                                                            >
                                                                {language === 'it' ? 'Nuova Richiesta' : 'New Request'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <form className="hero-request-form compact" onSubmit={handleRequestSubmit}>
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
                                                                <div className="hero-request-field">
                                                                    <Car size={18} />
                                                                    <input
                                                                        type="text"
                                                                        placeholder={language === 'it' ? 'Targa del veicolo' : 'Vehicle license plate'}
                                                                        value={requestTarga}
                                                                        onChange={(e) => setRequestTarga(e.target.value.toUpperCase())}
                                                                        style={{ textTransform: 'uppercase' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="hero-request-row">
                                                                <div className="hero-request-field hero-request-message">
                                                                    <MessageSquare size={18} />
                                                                    <input
                                                                        ref={messageInputRef}
                                                                        type="text"
                                                                        placeholder={language === 'it' ? 'Descrivi il ricambio di cui hai bisogno...' : 'Describe the part you need...'}
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
                                                                {language === 'it' ? 'Richiedi Preventivo' : 'Request Quote'}
                                                            </motion.button>
                                                        </form>
                                                    )}
                                                </div>
                                            </div>
                                        ) : activeTab === 'perizia' ? (
                                            <div className="perizia-flex-layout">
                                                <div className="perizia-table-section">
                                                    <PeriziaTable onSelectPlan={(planName) => {
                                                        const msg = `Vorrei maggiori informazioni sul pacchetto ${planName}.`;
                                                        setRequestMessage(msg);
                                                        if (isMobile) {
                                                            const form = document.querySelector('.perizia-form-section');
                                                            form?.scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                        setTimeout(() => messageInputRef.current?.focus(), 100);
                                                    }} />
                                                </div>

                                                <div className="perizia-form-section">
                                                    {requestSuccess ? (
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
                                                        <form className="hero-request-form compact" onSubmit={handleRequestSubmit}>
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
                                                                        ref={messageInputRef}
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
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="hero-search-form">

                                                {/* ===== SECTION 1: Dati principali & Località ===== */}
                                                <div className="adv-section">
                                                    <div className="configurator-banner" onClick={() => toggleSection('main')}>
                                                        <div className="configurator-banner-inner">
                                                            <div className="configurator-banner-shimmer" />
                                                            <div className="configurator-banner-content">
                                                                <div className="configurator-banner-left">
                                                                    <div className="configurator-banner-gold-line" />
                                                                    <div className="configurator-banner-text">
                                                                        <span className="configurator-banner-title">
                                                                            {language === 'it' ? 'Configura la tua auto' : 'Configure your car'}
                                                                        </span>
                                                                        <span className="configurator-banner-subtitle">
                                                                            {language === 'it' ? 'Seleziona i filtri per trovare la tua auto ideale' : 'Select filters to find your ideal car'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ChevronDown size={22} className={`configurator-banner-chevron ${expandedSections.main ? 'open' : ''}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {expandedSections.main && (
                                                        <div className="adv-section-body">
                                                            <div className="hero-search-row">
                                                                <label className="hero-search-field">
                                                                    <span className="field-label">Carrozzeria</span>
                                                                    <select value={bodyType} onChange={(e) => setBodyType(e.target.value)}>
                                                                        <option value="">Tutto</option>
                                                                        {dbCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                                    </select>
                                                                </label>
                                                                <label className="hero-search-field">
                                                                    <span className="field-label"><Car size={14} /> {t.searchBrand}</span>
                                                                    <select value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(''); }}>
                                                                        <option value="">{t.searchAllBrands}</option>
                                                                        {currentBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                                                                    </select>
                                                                </label>
                                                                <label className="hero-search-field">
                                                                    <span className="field-label"><Car size={14} /> {t.searchModel}</span>
                                                                    <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={!selectedBrand}>
                                                                        <option value="">{t.searchAllModels}</option>
                                                                        {availableModels.map(model => <option key={model} value={model}>{model}</option>)}
                                                                    </select>
                                                                </label>
                                                            </div>
                                                            <div className="hero-search-row">
                                                                <label className="hero-search-field hero-search-field-half">
                                                                    <span className="field-label">{t.searchPriceFrom}</span>
                                                                    <select value={priceMin} onChange={(e) => setPriceMin(e.target.value)}>
                                                                        <option value="">Da</option>
                                                                        {priceOptions.map(p => <option key={p} value={p}>€ {p.toLocaleString()}</option>)}
                                                                    </select>
                                                                </label>
                                                                <label className="hero-search-field hero-search-field-half">
                                                                    <span className="field-label">{t.searchPriceTo}</span>
                                                                    <select value={priceMax} onChange={(e) => setPriceMax(e.target.value)}>
                                                                        <option value="">A</option>
                                                                        {priceOptions.map(p => <option key={p} value={p}>€ {p.toLocaleString()}</option>)}
                                                                    </select>
                                                                </label>
                                                                <label className="hero-search-field hero-search-field-half">
                                                                    <span className="field-label"><Calendar size={14} /> Anno Da</span>
                                                                    <select value={yearMin} onChange={(e) => setYearMin(e.target.value)}>
                                                                        <option value="">Da</option>
                                                                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                                                                    </select>
                                                                </label>
                                                                <label className="hero-search-field hero-search-field-half">
                                                                    <span className="field-label">Anno A</span>
                                                                    <select value={yearMax} onChange={(e) => setYearMax(e.target.value)}>
                                                                        <option value="">A</option>
                                                                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                                                                    </select>
                                                                </label>
                                                            </div>
                                                            <div className="hero-search-row">
                                                                <label className="hero-search-field hero-search-field-half">
                                                                    <span className="field-label"><Gauge size={14} /> Chilometraggio Da</span>
                                                                    <select value={mileageMin} onChange={(e) => setMileageMin(e.target.value)}>
                                                                        <option value="">Da</option>
                                                                        {mileageOptions.map(km => <option key={km} value={km}>{km.toLocaleString()} km</option>)}
                                                                    </select>
                                                                </label>
                                                                <label className="hero-search-field hero-search-field-half">
                                                                    <span className="field-label">Chilometraggio A</span>
                                                                    <select value={mileageMax} onChange={(e) => setMileageMax(e.target.value)}>
                                                                        <option value="">A</option>
                                                                        {mileageOptions.map(km => <option key={km} value={km}>{km.toLocaleString()} km</option>)}
                                                                    </select>
                                                                </label>
                                                            </div>
                                                            {activeTab === 'rental' && (
                                                                <div className="hero-search-row">
                                                                    <label className="hero-search-field hero-search-field-half">
                                                                        <span className="field-label"><Calendar size={14} /> {t.pickupDate}</span>
                                                                        <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                                                    </label>
                                                                    <label className="hero-search-field hero-search-field-half">
                                                                        <span className="field-label"><Calendar size={14} /> {t.returnDate}</span>
                                                                        <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={pickupDate || new Date().toISOString().split('T')[0]} />
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ===== RICERCA AVANZATA ===== */}
                                                <div className="adv-section">
                                                    <div className="adv-section-header" onClick={() => toggleSection('advanced')}>
                                                        <h4><Sliders size={16} /> Ricerca Avanzata</h4>
                                                        <ChevronDown size={18} className={`adv-chevron ${expandedSections.advanced ? 'open' : ''}`} />
                                                    </div>
                                                    {expandedSections.advanced && (
                                                        <div className="advanced-search-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(212,175,55,0.3)' }}>

                                                            {/* ===== SECTION 2: Specifiche Tecniche ===== */}
                                                            <div className="adv-section">
                                                                <div className="adv-section-header" onClick={() => toggleSection('specs')}>
                                                                    <h4><Sliders size={16} /> Specifiche Tecniche</h4>
                                                                    <ChevronDown size={18} className={`adv-chevron ${expandedSections.specs ? 'open' : ''}`} />
                                                                </div>
                                                                {expandedSections.specs && (
                                                                    <div className="adv-section-body">
                                                                        <div className="hero-search-row">
                                                                            <label className="hero-search-field">
                                                                                <span className="field-label"><Fuel size={14} /> Carburante</span>
                                                                                <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                                                                                    <option value="">Tutto</option>
                                                                                    {dbFuels.map(f => <option key={f} value={f}>{f}</option>)}
                                                                                </select>
                                                                            </label>
                                                                            <label className="hero-search-field">
                                                                                <span className="field-label">Cambio</span>
                                                                                <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                                                                                    <option value="">Tutto</option>
                                                                                    {dbTransmissions.map(t => <option key={t} value={t}>{t}</option>)}
                                                                                </select>
                                                                            </label>
                                                                        </div>
                                                                        <div className="hero-search-row">
                                                                            <label className="hero-search-field hero-search-field-half">
                                                                                <span className="field-label">Potenza Da (kW)</span>
                                                                                <input type="number" placeholder="kW" value={powerMin} onChange={(e) => setPowerMin(e.target.value)} />
                                                                            </label>
                                                                            <label className="hero-search-field hero-search-field-half">
                                                                                <span className="field-label">Potenza A (kW)</span>
                                                                                <input type="number" placeholder="kW" value={powerMax} onChange={(e) => setPowerMax(e.target.value)} />
                                                                            </label>
                                                                        </div>
                                                                        <div className="hero-search-row" style={{ alignItems: 'end' }}>
                                                                            <div className="hero-search-field">
                                                                                <span className="field-label">N. di porte</span>
                                                                                <div className="adv-segment-group">
                                                                                    <button type="button" className={`adv-segment-btn ${doorsFilter === '' ? 'active' : ''}`} onClick={() => setDoorsFilter('')}>Tutto</button>
                                                                                    {doorOptions.map(d => (
                                                                                        <button type="button" key={d} className={`adv-segment-btn ${doorsFilter === d ? 'active' : ''}`} onClick={() => setDoorsFilter(d)}>{d}</button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* ===== SECTION 3: Condizione del veicolo ===== */}
                                                            <div className="adv-section">
                                                                <div className="adv-section-header" onClick={() => toggleSection('condition')}>
                                                                    <h4><Award size={16} /> Condizione del veicolo</h4>
                                                                    <ChevronDown size={18} className={`adv-chevron ${expandedSections.condition ? 'open' : ''}`} />
                                                                </div>
                                                                {expandedSections.condition && (
                                                                    <div className="adv-section-body">
                                                                        <span className="field-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Tipo di veicolo</span>
                                                                        <div className="adv-checkbox-grid">
                                                                            {allConditions.map(c => (
                                                                                <label key={c.value} className="adv-checkbox-item">
                                                                                    <div className={`adv-checkbox ${conditionFilters.includes(c.value) ? 'checked' : ''}`}>
                                                                                        {conditionFilters.includes(c.value) && <Check size={12} />}
                                                                                    </div>
                                                                                    <input type="checkbox" hidden checked={conditionFilters.includes(c.value)} onChange={() => toggleCondition(c.value)} />
                                                                                    <span>{c.label}</span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* ===== SECTION 4: Dotazioni ===== */}
                                                            <div className="adv-section">
                                                                <div className="adv-section-header" onClick={() => toggleSection('features')}>
                                                                    <h4><Sliders size={16} /> Dotazioni</h4>
                                                                    <ChevronDown size={18} className={`adv-chevron ${expandedSections.features ? 'open' : ''}`} />
                                                                </div>
                                                                {expandedSections.features && (
                                                                    <div className="adv-section-body">
                                                                        <div className="adv-checkbox-grid cols-2">
                                                                            {allFeatures.map(f => (
                                                                                <label key={f} className="adv-checkbox-item">
                                                                                    <div className={`adv-checkbox ${featureFilters.includes(f) ? 'checked' : ''}`}>
                                                                                        {featureFilters.includes(f) && <Check size={12} />}
                                                                                    </div>
                                                                                    <input type="checkbox" hidden checked={featureFilters.includes(f)} onChange={() => toggleFeature(f)} />
                                                                                    <span>{f}</span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* ===== SECTION 5: Esterni (Colors) ===== */}
                                                            <div className="adv-section">
                                                                <div className="adv-section-header" onClick={() => toggleSection('colors')}>
                                                                    <h4><Palette size={16} /> Esterni</h4>
                                                                    <ChevronDown size={18} className={`adv-chevron ${expandedSections.colors ? 'open' : ''}`} />
                                                                </div>
                                                                {expandedSections.colors && (
                                                                    <div className="adv-section-body">
                                                                        <span className="field-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Colore carrozzeria</span>
                                                                        <div className="adv-color-grid">
                                                                            {exteriorColors.map(color => (
                                                                                <button
                                                                                    type="button"
                                                                                    key={color.name}
                                                                                    className={`adv-color-btn ${colorFilters.includes(color.name) ? 'selected' : ''}`}
                                                                                    onClick={() => toggleColor(color.name)}
                                                                                >
                                                                                    <span className="adv-color-swatch" style={{ backgroundColor: color.hex }} />
                                                                                    <span className="adv-color-label">{color.name}</span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* ===== SECTION 6: Interni (Interior) ===== */}
                                                            <div className="adv-section">
                                                                <div className="adv-section-header" onClick={() => toggleSection('interior')}>
                                                                    <h4><Armchair size={16} /> Interni</h4>
                                                                    <ChevronDown size={18} className={`adv-chevron ${expandedSections.interior ? 'open' : ''}`} />
                                                                </div>
                                                                {expandedSections.interior && (
                                                                    <div className="adv-section-body">
                                                                        <span className="field-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Colore interni</span>
                                                                        <div className="adv-color-grid">
                                                                            {interiorColors.map(color => (
                                                                                <button
                                                                                    type="button"
                                                                                    key={color.name}
                                                                                    className={`adv-color-btn ${interiorColorFilters.includes(color.name) ? 'selected' : ''}`}
                                                                                    onClick={() => toggleInteriorColor(color.name)}
                                                                                >
                                                                                    <span className="adv-color-swatch" style={{ backgroundColor: color.hex }} />
                                                                                    <span className="adv-color-label">{color.name}</span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        <span className="field-label" style={{ marginTop: '1rem', marginBottom: '0.5rem', display: 'block' }}>Materiale</span>
                                                                        <div className="adv-checkbox-grid cols-2">
                                                                            {allMaterials.map(m => (
                                                                                <label key={m} className="adv-checkbox-item">
                                                                                    <div className={`adv-checkbox ${materialFilters.includes(m) ? 'checked' : ''}`}>
                                                                                        {materialFilters.includes(m) && <Check size={12} />}
                                                                                    </div>
                                                                                    <input type="checkbox" hidden checked={materialFilters.includes(m)} onChange={() => toggleMaterial(m)} />
                                                                                    <span>{m}</span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* ===== SECTION 7: Ambiente ===== */}
                                                            <div className="adv-section">
                                                                <div className="adv-section-header" onClick={() => toggleSection('ambiente')}>
                                                                    <h4><Leaf size={16} /> Ambiente</h4>
                                                                    <ChevronDown size={18} className={`adv-chevron ${expandedSections.ambiente ? 'open' : ''}`} />
                                                                </div>
                                                                {expandedSections.ambiente && (
                                                                    <div className="adv-section-body">
                                                                        <div className="hero-search-row">
                                                                            <label className="hero-search-field">
                                                                                <span className="field-label">Classe emissioni (da)</span>
                                                                                <select value={emissionClass} onChange={(e) => setEmissionClass(e.target.value)}>
                                                                                    <option value="">Tutto</option>
                                                                                    {emissionClasses.map(ec => <option key={ec} value={ec}>{ec}</option>)}
                                                                                </select>
                                                                            </label>
                                                                            <div className="hero-search-field">
                                                                                <span className="field-label">Bollino ambientale (da)</span>
                                                                                <div className="adv-segment-group">
                                                                                    <button type="button" className={`adv-segment-btn ${ecoBadge === '' ? 'active' : ''}`} onClick={() => setEcoBadge('')}>Tutto</button>
                                                                                    {ecoBadgeLevels.map(level => (
                                                                                        <button
                                                                                            type="button"
                                                                                            key={level}
                                                                                            className={`adv-segment-btn eco-badge-btn ${ecoBadge === level ? 'active' : ''}`}
                                                                                            onClick={() => setEcoBadge(level)}
                                                                                        >
                                                                                            <span className={`eco-badge-dot eco-badge-${level}`} />
                                                                                            {level}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* ===== SECTION 8: Altre informazioni ===== */}
                                                            <div className="adv-section">
                                                                <div className="adv-section-header" onClick={() => toggleSection('other')}>
                                                                    <h4><Info size={16} /> Altre informazioni</h4>
                                                                    <ChevronDown size={18} className={`adv-chevron ${expandedSections.other ? 'open' : ''}`} />
                                                                </div>
                                                                {expandedSections.other && (
                                                                    <div className="adv-section-body">
                                                                        <div className="hero-search-row" style={{ alignItems: 'center' }}>
                                                                            <label className="adv-checkbox-item" style={{ cursor: 'pointer' }}>
                                                                                <div className={`adv-checkbox ${vatDeductible ? 'checked' : ''}`}>
                                                                                    {vatDeductible && <Check size={12} />}
                                                                                </div>
                                                                                <input type="checkbox" hidden checked={vatDeductible} onChange={() => setVatDeductible(!vatDeductible)} />
                                                                                <span>IVA deducibile</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                        </div>
                                                    )}
                                                </div>

                                                {/* ===== Actions: Reset + Search ===== */}
                                                <div className="hero-search-actions">
                                                    <button type="button" className="adv-reset-btn" onClick={handleResetFilters}>
                                                        {language === 'it' ? 'Rimuovi filtri' : 'Reset Filters'}
                                                    </button>
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
            </div >

        </section >
    );
};
