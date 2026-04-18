import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft, Star, Fuel, Users, Gauge, X, Calendar,
    Check, Filter, ChevronDown, ArrowUpDown, Navigation, Tag, ShoppingCart, Car as CarIcon,
    ZoomIn, ZoomOut, RotateCcw, Maximize2, Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { OrderForm } from './OrderForm';

interface Car {
    id: number;
    name: string;
    brand: string;
    image: string;
    price: number;
    specs: {
        power: string;
        seats: number;
        fuel: string;
        transmission: string;
    };
    category: string;
    rating: number;
    available: boolean;
    year: number | null;
    km: string | null;
    euro_standard: string | null;
    description?: string;
    listing_type: 'sale' | 'rental' | 'both' | 'importazione';
    images?: string[];
}

import type { SearchParams } from '../types/SearchParams';

interface FleetProps {
    searchParams?: SearchParams;
    onClearSearch?: () => void;
}

export const Fleet = ({ searchParams, onClearSearch }: FleetProps) => {
    const { t } = useLanguage();
    const [cars, setCars] = useState<Car[]>([]);
    // const [loading, setLoading] = useState(true); // Moved below

    // Filtering & Sorting State
    const [sortBy, setSortBy] = useState('relevance');
    const [filters, setFilters] = useState({
        brands: [] as string[],
        categories: [] as string[],
        fuel: [] as string[], // Legacy fuel
        filters_fuelType: [] as string[], // Advanced fuel type
        minPrice: 0,
        maxPrice: 1000000,
        listingType: 'all' as 'all' | 'sale' | 'rental' | 'both' | 'importazione',
        model: '',
        // Advanced Filters
        bodyType: '',
        transmission: '',
        powerMin: 0,
        powerMax: 1000,
        year: 0,
        km: 1000000,
        color: [] as string[],
        interiorColor: [] as string[],
        features: [] as string[],
        condition: [] as string[],
        sellerType: 'all' as 'all' | 'dealer' | 'private',
        doors: ''
    });
    const [compareList, setCompareList] = useState<Car[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [brandLetter, setBrandLetter] = useState('');  // Alphabetic brand filter

    // Detail Modal State
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Card gallery state
    const [cardImageIndices, setCardImageIndices] = useState<Record<number, number>>({});

    // Lightbox state
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Zoom state
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const panStart = useRef({ x: 0, y: 0 });
    const lightboxImgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isSidebarOpen]);

    useEffect(() => {
        if (selectedCar) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [selectedCar]);

    useEffect(() => {
        if (lightboxImages.length > 0) {
            document.body.style.overflow = 'hidden';
        } else if (!selectedCar && !isSidebarOpen) {
            document.body.style.overflow = '';
        }
    }, [lightboxImages, selectedCar, isSidebarOpen]);

    // Reset zoom when lightbox image changes or closes
    useEffect(() => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    }, [lightboxIndex, lightboxImages]);

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev + 0.5, 5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => {
            const next = Math.max(prev - 0.5, 1);
            if (next === 1) setPanOffset({ x: 0, y: 0 });
            return next;
        });
    }, []);

    const handleZoomReset = useCallback(() => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) {
            setZoomLevel(prev => Math.min(prev + 0.25, 5));
        } else {
            setZoomLevel(prev => {
                const next = Math.max(prev - 0.25, 1);
                if (next === 1) setPanOffset({ x: 0, y: 0 });
                return next;
            });
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoomLevel <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        panStart.current = { ...panOffset };
    }, [zoomLevel, panOffset]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPanOffset({
            x: panStart.current.x + dx,
            y: panStart.current.y + dy
        });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch handlers for mobile pinch-zoom
    const lastTouchDist = useRef(0);
    const lastTouchCenter = useRef({ x: 0, y: 0 });

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDist.current = Math.hypot(dx, dy);
            lastTouchCenter.current = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2
            };
        } else if (e.touches.length === 1 && zoomLevel > 1) {
            setIsDragging(true);
            dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            panStart.current = { ...panOffset };
        }
    }, [zoomLevel, panOffset]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const scale = dist / lastTouchDist.current;
            setZoomLevel(prev => Math.min(Math.max(prev * scale, 1), 5));
            lastTouchDist.current = dist;
        } else if (e.touches.length === 1 && isDragging) {
            const tdx = e.touches[0].clientX - dragStart.current.x;
            const tdy = e.touches[0].clientY - dragStart.current.y;
            setPanOffset({
                x: panStart.current.x + tdx,
                y: panStart.current.y + tdy
            });
        }
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        if (zoomLevel <= 1) setPanOffset({ x: 0, y: 0 });
    }, [zoomLevel]);

    // Sync with SearchParams from Hero
    useEffect(() => {
        if (searchParams) {
            setFilters(prev => ({
                ...prev,
                brands: searchParams.brand ? [searchParams.brand] : [],
                categories: searchParams.category ? [searchParams.category] : [],
                fuel: searchParams.fuel ? [searchParams.fuel] : [],
                minPrice: searchParams.minPrice || 0,
                maxPrice: searchParams.maxPrice > 0 ? searchParams.maxPrice : 1000000,
                listingType: searchParams.listingType,
                model: searchParams.model || '',
                // Sync advanced filters
                bodyType: searchParams.bodyType || '',
                filters_fuelType: searchParams.fuelType || [],
                transmission: searchParams.transmission || '',
                powerMin: searchParams.powerMin || 0,
                powerMax: searchParams.powerMax || 1000,
                year: searchParams.year || 0,
                km: searchParams.km || 1000000,
                doors: searchParams.doors || '',
                color: searchParams.color || [],
                interiorColor: searchParams.interiorColor || [],
                features: searchParams.features || [],
                condition: searchParams.condition as string[] || [],
                sellerType: searchParams.sellerType || 'all'
            }));
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchCars = async () => {
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .order('id');

            if (error) {
                console.error('Error fetching cars:', error);
            } else {
                const formattedCars: Car[] = (data || []).map((car: any) => ({
                    id: car.id,
                    name: car.name,
                    brand: car.brand,
                    image: car.image,
                    price: Number(car.price),
                    specs: {
                        power: car.power,
                        seats: car.seats,
                        fuel: car.fuel,
                        transmission: car.transmission
                    },
                    category: car.category,
                    rating: Number(car.rating),
                    available: car.available,
                    year: car.year,
                    km: car.km,
                    euro_standard: car.euro_standard,
                    description: car.description,
                    listing_type: car.listing_type || 'rental' as 'sale' | 'rental' | 'both',
                    images: car.images || [] // Assuming images might come from DB
                }));
                setCars(formattedCars);
            }
            setLoading(false);
        };

        fetchCars();
    }, []);

    // Derived Data for Filters
    const availableBrands = useMemo(() => Array.from(new Set(cars.map(c => c.brand))), [cars]);
    const availableCategories = useMemo(() => Array.from(new Set(cars.map(c => c.category))), [cars]);
    const availableFuels = useMemo(() => Array.from(new Set(cars.map(c => c.specs.fuel))), [cars]);

    // Filtering Logic
    const filteredCars = useMemo(() => {
        let result = [...cars];

        // Apply filters
        if (filters.brands.length > 0) {
            result = result.filter(c => filters.brands.includes(c.brand));
        }
        if (filters.categories.length > 0) {
            result = result.filter(c => filters.categories.includes(c.category));
        }
        if (filters.fuel.length > 0) {
            result = result.filter(c => filters.fuel.includes(c.specs.fuel));
        }
        if (filters.maxPrice > 0) {
            result = result.filter(c => c.price === 0 || (c.price >= filters.minPrice && c.price <= filters.maxPrice));
        }
        if (filters.listingType !== 'all') {
            if (filters.listingType === 'sale') {
                result = result.filter(c => c.listing_type === 'sale' || c.listing_type === 'both');
            } else if (filters.listingType === 'rental') {
                result = result.filter(c => c.listing_type === 'rental' || c.listing_type === 'both');
            } else if (filters.listingType === 'both') {
                result = result.filter(c => c.listing_type === 'both');
            } else if (filters.listingType === 'importazione') {
                result = result.filter(c => c.listing_type === 'importazione');
            }
        }

        if (filters.model) {
            result = result.filter(c => c.name.toLowerCase().includes(filters.model.toLowerCase()));
        }

        // Advanced Filters Implementation
        if (filters.bodyType) {
            result = result.filter(c => c.category === filters.bodyType);
        }

        if (filters.filters_fuelType.length > 0) {
            result = result.filter(c => filters.filters_fuelType.includes(c.specs.fuel));
        }

        if (filters.transmission) {
            result = result.filter(c => c.specs.transmission === filters.transmission);
        }

        if (filters.powerMin > 0) {
            // Try to parse power from string "XX kW (YY CV)"
            result = result.filter(c => {
                const powerStr = c.specs.power || '';
                const powerKw = parseInt(powerStr.split(' ')[0]) || 0;
                return powerKw >= filters.powerMin;
            });
        }

        if (filters.powerMax < 1000) {
            result = result.filter(c => {
                const powerStr = c.specs.power || '';
                const powerKw = parseInt(powerStr.split(' ')[0]) || 0;
                return powerKw <= filters.powerMax;
            });
        }

        if (filters.year > 0) {
            result = result.filter(c => (c.year || 0) >= filters.year);
        }

        if (filters.km < 1000000) {
            result = result.filter(c => {
                const kmVal = typeof c.km === 'string' ? parseInt(c.km.replace('.', '').replace(' km', '')) : (c.km || 0);
                return kmVal <= filters.km;
            });
        }

        // Note: colors, interiorColors, features, doors, sellerType, condition 
        // are currently not in the Car interface but logic is prepared:
        // if (filters.doors && c.specs.doors) ...
        // if (filters.color.length && c.color) ...


        // Apply Sorting
        switch (sortBy) {
            case 'price_asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'year_desc':
                result.sort((a, b) => (b.year || 0) - (a.year || 0));
                break;
            case 'relevance':
            default:
                result.sort((a, b) => b.rating - a.rating);
                break;
        }

        return result;
    }, [cars, filters, sortBy]);

    // Handlers
    const toggleFilter = (type: 'brands' | 'categories' | 'fuel', value: string) => {
        setFilters(prev => {
            const current = prev[type];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [type]: updated };
        });
    };

    const toggleCompare = (car: Car) => {
        setCompareList(prev => {
            if (prev.find(c => c.id === car.id)) {
                return prev.filter(c => c.id !== car.id);
            }
            return [...prev, car];
        });
    };

    const handleViewDetails = (car: Car) => {
        setSelectedCar(car);
        setCurrentImageIndex(0);
        // document.body.style.overflow = 'hidden'; // Add logic to handle overflow in effect
    };

    const closeModal = () => {
        setSelectedCar(null);
        document.body.style.overflow = '';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('it-IT').format(price);
    };

    if (loading) {
        return (
            <section className="fleet-section" id="fleet">
                <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <div className="text-gold" style={{ fontSize: '1.5rem' }}>Loading fleet...</div>
                </div>
            </section>
        );
    }

    return (
        <section className="fleet-section" id="fleet">
            {/* Background elements */}
            <div className="racing-stripes">
                <div className="stripe"></div>
                <div className="stripe"></div>
            </div>

            <div className="container">
                <div className="fleet-layout">
                    {/* Mobile Sidebar Overlay */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                className="sidebar-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        )}
                    </AnimatePresence>

                    {/* Sidebar Filters */}
                    <aside className={`fleet-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <div className="sidebar-header">
                            <h3><Filter size={20} /> {t.filters}</h3>
                            <div className="sidebar-actions">
                                <button
                                    className="reset-btn"
                                    onClick={() => {
                                        setFilters({
                                            brands: [], categories: [], minPrice: 0, maxPrice: 1000000, fuel: [], listingType: 'all' as 'all' | 'sale' | 'rental' | 'both', model: '',
                                            filters_fuelType: [], bodyType: '', transmission: '', powerMin: 0, powerMax: 1000, year: 0, km: 1000000,
                                            color: [], interiorColor: [], features: [], condition: [], sellerType: 'all', doors: ''
                                        });
                                        if (onClearSearch) onClearSearch();
                                    }}
                                >
                                    {t.resetFilters}
                                </button>
                                <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Listing Type Filter */}
                        <div className="filter-group">
                            <div className="filter-header">
                                <span>Tipo</span>
                                <ChevronDown size={16} />
                            </div>
                            <div className="listing-type-buttons">
                                <button
                                    className={`listing-type-btn ${filters.listingType === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilters({ ...filters, listingType: 'all' })}
                                >
                                    Tutti
                                </button>
                                <button
                                    className={`listing-type-btn sale ${filters.listingType === 'sale' ? 'active' : ''}`}
                                    onClick={() => setFilters({ ...filters, listingType: 'sale' })}
                                >
                                    <ShoppingCart size={14} /> Vendita
                                </button>
                                <button
                                    className={`listing-type-btn rental ${filters.listingType === 'rental' ? 'active' : ''}`}
                                    onClick={() => setFilters({ ...filters, listingType: 'rental' })}
                                >
                                    <CarIcon size={14} /> Noleggio
                                </button>
                                <button
                                    className={`listing-type-btn both ${filters.listingType === 'both' ? 'active' : ''}`}
                                    onClick={() => setFilters({ ...filters, listingType: 'both' })}
                                >
                                    <ShoppingCart size={14} /> Entrambi
                                </button>
                                <button
                                    className={`listing-type-btn importazione ${filters.listingType === 'importazione' ? 'active' : ''}`}
                                    onClick={() => setFilters({ ...filters, listingType: 'importazione' })}
                                >
                                    <Globe size={14} /> Importazione
                                </button>
                            </div>
                        </div>

                        {/* Brands Filter */}
                        <div className="filter-group">
                            <div className="filter-header">
                                <span>Brand</span>
                                <ChevronDown size={16} />
                            </div>
                            {/* Alphabetic letter bar */}
                            <div className="brand-alpha-bar">
                                <button
                                    className={`alpha-btn ${brandLetter === '' ? 'active' : ''}`}
                                    onClick={() => setBrandLetter('')}
                                >Tutti</button>
                                {Array.from(new Set(availableBrands.map(b => b[0]?.toUpperCase()).filter(Boolean))).sort().map(letter => (
                                    <button
                                        key={letter}
                                        className={`alpha-btn ${brandLetter === letter ? 'active' : ''}`}
                                        onClick={() => setBrandLetter(brandLetter === letter ? '' : letter)}
                                    >{letter}</button>
                                ))}
                            </div>
                            <div className="filter-options">
                                {availableBrands
                                    .filter(brand => brandLetter === '' || brand[0]?.toUpperCase() === brandLetter)
                                    .sort()
                                    .map(brand => (
                                        <label key={brand} className="filter-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={filters.brands.includes(brand)}
                                                onChange={() => toggleFilter('brands', brand)}
                                            />
                                            <span>{brand}</span>
                                        </label>
                                    ))}
                            </div>
                        </div>

                        {/* Categories Filter */}
                        <div className="filter-group">
                            <div className="filter-header">
                                <span>Category</span>
                                <ChevronDown size={16} />
                            </div>
                            <div className="filter-options">
                                {availableCategories.map(cat => (
                                    <label key={cat} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={filters.categories.includes(cat)}
                                            onChange={() => toggleFilter('categories', cat)}
                                        />
                                        <span>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="filter-group">
                            <div className="filter-header">
                                <span>{t.sortPriceAsc.split(':')[0]}</span>
                                <ChevronDown size={16} />
                            </div>
                            <div className="filter-range">
                                <input
                                    type="range"
                                    min="0"
                                    max="1000000"
                                    step="1000"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                                    className="price-slider"
                                />
                                <div className="price-inputs">
                                    <span>€0</span>
                                    <span>€{formatPrice(filters.maxPrice)}+</span>
                                </div>
                            </div>
                        </div>

                        {/* Fuel Filter */}
                        <div className="filter-group">
                            <div className="filter-header">
                                <span>{t.searchFuel}</span>
                                <ChevronDown size={16} />
                            </div>
                            <div className="filter-options">
                                {availableFuels.map(fuel => (
                                    <label key={fuel} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={filters.fuel.includes(fuel)}
                                            onChange={() => toggleFilter('fuel', fuel)}
                                        />
                                        <span>{fuel}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="fleet-content">
                        {/* Toolbar */}
                        <div className="fleet-toolbar">
                            <div className="results-count">
                                <strong>{filteredCars.length}</strong> {t.compareCount.split(' ')[0]} {t.ourFleet}
                            </div>

                            <div className="toolbar-actions">
                                <button className="mobile-filter-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    <Filter size={18} /> {t.filters}
                                </button>

                                <div className="sort-wrapper">
                                    <span className="sort-label">{t.sortBy}:</span>
                                    <select
                                        className="sort-dropdown"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="relevance">{t.sortRelevance}</option>
                                        <option value="price_asc">{t.sortPriceAsc}</option>
                                        <option value="price_desc">{t.sortPriceDesc}</option>
                                        <option value="year_desc">{t.sortYearDesc}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Pills */}
                        {(filters.brands.length > 0 || filters.categories.length > 0) && (
                            <div className="active-filters">
                                {filters.brands.map(b => (
                                    <span key={b} className="filter-pill">
                                        {b} <X size={14} onClick={() => toggleFilter('brands', b)} />
                                    </span>
                                ))}
                                {filters.categories.map(c => (
                                    <span key={c} className="filter-pill">
                                        {c} <X size={14} onClick={() => toggleFilter('categories', c)} />
                                    </span>
                                ))}
                                <button
                                    className="clear-all-btn"
                                    onClick={() => {
                                        setFilters({
                                            brands: [], categories: [], minPrice: 0, maxPrice: 1000000, fuel: [], listingType: 'all' as 'all' | 'sale' | 'rental' | 'both', model: '',
                                            filters_fuelType: [], bodyType: '', transmission: '', powerMin: 0, powerMax: 1000, year: 0, km: 1000000,
                                            color: [], interiorColor: [], features: [], condition: [], sellerType: 'all', doors: ''
                                        });
                                        if (onClearSearch) onClearSearch();
                                    }}
                                >
                                    {t.clearAll}
                                </button>
                            </div>
                        )}

                        {/* Grid */}
                        <motion.div
                            className="cars-grid"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            <AnimatePresence>
                                {filteredCars.length === 0 && (
                                    <motion.div
                                        className="no-results"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            gridColumn: '1 / -1',
                                            textAlign: 'center',
                                            padding: '4rem 2rem',
                                            color: 'var(--color-text-muted)'
                                        }}
                                    >
                                        <CarIcon size={48} style={{ color: 'var(--color-gold)', opacity: 0.4, marginBottom: '1.5rem' }} />
                                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                                            {t.noResults || 'Nessun veicolo trovato'}
                                        </h3>
                                        <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                            {t.tryDifferentFilters || 'Prova a modificare i filtri di ricerca'}
                                        </p>
                                        <button
                                            className="book-btn"
                                            onClick={() => {
                                                setFilters({
                                                    brands: [], categories: [], minPrice: 0, maxPrice: 1000000, fuel: [], listingType: 'all' as 'all' | 'sale' | 'rental' | 'both', model: '',
                                                    filters_fuelType: [], bodyType: '', transmission: '', powerMin: 0, powerMax: 1000, year: 0, km: 1000000,
                                                    color: [], interiorColor: [], features: [], condition: [], sellerType: 'all', doors: ''
                                                });
                                                if (onClearSearch) onClearSearch();
                                            }}
                                            style={{ margin: '0 auto' }}
                                        >
                                            {t.resetFilters}
                                        </button>
                                    </motion.div>
                                )}
                                {filteredCars.map(car => (
                                    <motion.div
                                        key={car.id}
                                        className="car-card"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                                    >
                                        <div className="car-image-wrapper">
                                            <img
                                                src={(car.images && car.images.length > 0) ? car.images[cardImageIndices[car.id] || 0] : car.image}
                                                alt={car.name}
                                                loading="lazy"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const imgs = (car.images && car.images.length > 0) ? car.images : [car.image];
                                                    setLightboxImages(imgs);
                                                    setLightboxIndex(cardImageIndices[car.id] || 0);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            {(car.images && car.images.length > 1) && (
                                                <>
                                                    <button
                                                        className="card-gallery-nav prev"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCardImageIndices(prev => ({
                                                                ...prev,
                                                                [car.id]: (prev[car.id] || 0) === 0 ? (car.images!.length - 1) : (prev[car.id] || 0) - 1
                                                            }));
                                                        }}
                                                    >
                                                        <ChevronLeft size={18} />
                                                    </button>
                                                    <button
                                                        className="card-gallery-nav next"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCardImageIndices(prev => ({
                                                                ...prev,
                                                                [car.id]: (prev[car.id] || 0) === (car.images!.length - 1) ? 0 : (prev[car.id] || 0) + 1
                                                            }));
                                                        }}
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                    <div className="card-gallery-dots">
                                                        {car.images.slice(0, 8).map((_, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`dot ${idx === (cardImageIndices[car.id] || 0) ? 'active' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCardImageIndices(prev => ({ ...prev, [car.id]: idx }));
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                            {!car.available && <div className="unavailable-badge">Non Disponibile</div>}
                                            <div className="car-category-badge">{car.category}</div>
                                            <div className={`listing-type-badge ${car.listing_type}`}>
                                                {car.listing_type === 'sale' ? (
                                                    <><ShoppingCart size={12} /> Vendita</>
                                                ) : car.listing_type === 'both' ? (
                                                    <><ShoppingCart size={12} /> Vendita / Noleggio</>
                                                ) : car.listing_type === 'importazione' ? (
                                                    <><Globe size={12} /> Importazione</>
                                                ) : (
                                                    <><CarIcon size={12} /> Noleggio</>
                                                )}
                                            </div>
                                            <div className="card-actions-overlay">
                                                <button
                                                    className={`action-btn ${compareList.find(c => c.id === car.id) ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); toggleCompare(car); }}
                                                    title={t.compare}
                                                >
                                                    <ArrowUpDown size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="car-info">
                                            <div className="car-header">
                                                <div>
                                                    <span className="car-brand">{car.brand}</span>
                                                    <h3 className="car-name">{car.name}</h3>
                                                </div>
                                                <div className="car-rating">
                                                    <Star size={14} fill="var(--color-gold)" stroke="var(--color-gold)" />
                                                    <span>{car.rating}</span>
                                                </div>
                                            </div>

                                            <div className="car-specs">
                                                <div className="spec">
                                                    <Gauge size={16} /> <span>{car.specs.power}</span>
                                                </div>
                                                <div className="spec">
                                                    <Users size={16} /> <span>{car.specs.seats}</span>
                                                </div>
                                                <div className="spec">
                                                    <Fuel size={16} /> <span>{car.specs.fuel}</span>
                                                </div>
                                            </div>

                                            {/* Additional Info Tags */}
                                            <div className="car-tags">
                                                {car.year && (
                                                    <span className="car-tag">
                                                        <Calendar size={12} /> {car.year}
                                                    </span>
                                                )}
                                                {car.km && (
                                                    <span className="car-tag">
                                                        <Navigation size={12} /> {car.km}.000 km
                                                    </span>
                                                )}
                                                {car.euro_standard && (
                                                    <span className="car-tag">
                                                        <Tag size={12} /> {car.euro_standard}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="car-footer">
                                                <div className="car-price">
                                                    {car.price > 0 ? (
                                                        <>
                                                            <span className="price">€{formatPrice(car.price)}</span>
                                                            {(car.listing_type === 'rental' || car.listing_type === 'both') && <span className="per-day">/giorno</span>}
                                                        </>
                                                    ) : (
                                                        <span className="price price-request">Su richiesta</span>
                                                    )}
                                                </div>
                                                <button
                                                    className="book-btn"
                                                    onClick={() => handleViewDetails(car)}
                                                >
                                                    {t.details} <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </main>
                </div>
            </div>

            {/* Compare Bar */}
            <div className={`compare-bar ${compareList.length > 0 ? 'visible' : ''}`}>
                <div className="container compare-content">
                    <div className="compare-info">
                        <strong>{compareList.length}</strong> {t.compareCount}
                    </div>
                    <div className="compare-vehicles">
                        {compareList.map(car => (
                            <div key={car.id} className="relative group">
                                <img src={car.image} alt={car.name} className="compare-thumb" />
                                <button
                                    className="remove-compare-btn"
                                    onClick={() => toggleCompare(car)}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="compare-actions">
                        <button className="clear-btn" onClick={() => setCompareList([])}>
                            {t.clearAll}
                        </button>
                        <button className="compare-btn-primary" disabled={compareList.length < 2}>
                            {t.compare} <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Car Detail Modal */}
            <AnimatePresence>
                {selectedCar && (
                    <motion.div
                        className="booking-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            className="booking-modal"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="close-modal" onClick={closeModal}>
                                <X size={24} />
                            </button>

                            <div className="detail-modal-content">
                                {/* Car Image Gallery */}
                                <div className="detail-car-image">
                                    <div className="gallery-container relative">
                                        <img
                                            src={(selectedCar.images && selectedCar.images.length > 0) ? selectedCar.images[currentImageIndex] : selectedCar.image}
                                            alt={selectedCar.name}
                                            className="modal-gallery-image"
                                            onClick={() => {
                                                const imgs = (selectedCar.images && selectedCar.images.length > 0) ? selectedCar.images : [selectedCar.image];
                                                setLightboxImages(imgs);
                                                setLightboxIndex(currentImageIndex);
                                            }}
                                            style={{ cursor: 'zoom-in' }}
                                        />
                                        <button
                                            className="gallery-zoom-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const imgs = (selectedCar.images && selectedCar.images.length > 0) ? selectedCar.images : [selectedCar.image];
                                                setLightboxImages(imgs);
                                                setLightboxIndex(currentImageIndex);
                                            }}
                                            title="Zoom"
                                        >
                                            <Maximize2 size={18} />
                                        </button>

                                        {(selectedCar.images && selectedCar.images.length > 1) && (
                                            <>
                                                <button
                                                    className="gallery-nav prev"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImageIndex(prev => prev === 0 ? (selectedCar.images?.length || 1) - 1 : prev - 1);
                                                    }}
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button
                                                    className="gallery-nav next"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImageIndex(prev => prev === ((selectedCar.images?.length || 1) - 1) ? 0 : prev + 1);
                                                    }}
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                                <div className="gallery-dots">
                                                    {selectedCar.images.map((_, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCurrentImageIndex(idx);
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="car-category-badge">{selectedCar.category}</div>
                                    <div className={`listing-type-badge ${selectedCar.listing_type}`}>
                                        {selectedCar.listing_type === 'sale' ? (
                                            <><ShoppingCart size={12} /> Vendita</>
                                        ) : selectedCar.listing_type === 'both' ? (
                                            <><ShoppingCart size={12} /> Vendita / Noleggio</>
                                        ) : selectedCar.listing_type === 'importazione' ? (
                                            <><Globe size={12} /> Importazione</>
                                        ) : (
                                            <><CarIcon size={12} /> Noleggio</>
                                        )}
                                    </div>
                                </div>

                                {/* Car Title & Price */}
                                <div className="detail-header">
                                    <div>
                                        <span className="car-brand" style={{ fontSize: '0.85rem' }}>{selectedCar.brand}</span>
                                        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{selectedCar.name}</h3>
                                    </div>
                                    <div className="detail-price">
                                        <span className="text-gold" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                                            {selectedCar.price > 0 ? `€${formatPrice(selectedCar.price)}` : 'Su richiesta'}
                                        </span>
                                        {selectedCar.price > 0 && (selectedCar.listing_type === 'rental' || selectedCar.listing_type === 'both') && (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>/giorno</span>
                                        )}
                                    </div>
                                </div>

                                {/* Specs Grid */}
                                <div className="detail-specs-grid">
                                    <div className="detail-spec">
                                        <Gauge size={18} className="text-gold" />
                                        <div>
                                            <span className="detail-spec-label">Potenza</span>
                                            <span className="detail-spec-value">{selectedCar.specs.power}</span>
                                        </div>
                                    </div>
                                    <div className="detail-spec">
                                        <Users size={18} className="text-gold" />
                                        <div>
                                            <span className="detail-spec-label">Posti</span>
                                            <span className="detail-spec-value">{selectedCar.specs.seats}</span>
                                        </div>
                                    </div>
                                    <div className="detail-spec">
                                        <Fuel size={18} className="text-gold" />
                                        <div>
                                            <span className="detail-spec-label">Carburante</span>
                                            <span className="detail-spec-value">{selectedCar.specs.fuel}</span>
                                        </div>
                                    </div>
                                    <div className="detail-spec">
                                        <ArrowUpDown size={18} className="text-gold" />
                                        <div>
                                            <span className="detail-spec-label">Cambio</span>
                                            <span className="detail-spec-value">{selectedCar.specs.transmission}</span>
                                        </div>
                                    </div>
                                    {selectedCar.year && (
                                        <div className="detail-spec">
                                            <Calendar size={18} className="text-gold" />
                                            <div>
                                                <span className="detail-spec-label">Anno</span>
                                                <span className="detail-spec-value">{selectedCar.year}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedCar.km && (
                                        <div className="detail-spec">
                                            <Navigation size={18} className="text-gold" />
                                            <div>
                                                <span className="detail-spec-label">Chilometri</span>
                                                <span className="detail-spec-value">{selectedCar.km}.000 km</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedCar.euro_standard && (
                                        <div className="detail-spec">
                                            <Check size={18} className="text-gold" />
                                            <div>
                                                <span className="detail-spec-label">Euro</span>
                                                <span className="detail-spec-value">{selectedCar.euro_standard}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {selectedCar.description && (
                                    <div className="detail-description">
                                        <h4 style={{ fontSize: '0.85rem', color: 'var(--color-gold)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Descrizione
                                        </h4>
                                        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                            {selectedCar.description}
                                        </p>
                                    </div>
                                )}

                                {/* Order Form */}
                                <OrderForm
                                    carId={selectedCar.id}
                                    carName={selectedCar.name}
                                    carBrand={selectedCar.brand}
                                    listingType={selectedCar.listing_type}
                                    onClose={() => setSelectedCar(null)}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullscreen Lightbox with Zoom */}
            <AnimatePresence>
                {lightboxImages.length > 0 && (
                    <motion.div
                        className="lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setLightboxImages([]); handleZoomReset(); }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <button
                            className="lightbox-close"
                            onClick={() => { setLightboxImages([]); handleZoomReset(); }}
                        >
                            <X size={28} />
                        </button>

                        {/* Zoom Controls */}
                        <div className="lightbox-zoom-controls" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="zoom-ctrl-btn"
                                onClick={handleZoomIn}
                                disabled={zoomLevel >= 5}
                                title="Zoom In"
                            >
                                <ZoomIn size={20} />
                            </button>
                            <span className="zoom-level-display">{Math.round(zoomLevel * 100)}%</span>
                            <button
                                className="zoom-ctrl-btn"
                                onClick={handleZoomOut}
                                disabled={zoomLevel <= 1}
                                title="Zoom Out"
                            >
                                <ZoomOut size={20} />
                            </button>
                            <button
                                className="zoom-ctrl-btn"
                                onClick={handleZoomReset}
                                disabled={zoomLevel === 1}
                                title="Reset Zoom"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>

                        <div
                            className="lightbox-content"
                            ref={lightboxImgRef}
                            onClick={(e) => e.stopPropagation()}
                            onWheel={handleWheel}
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            style={{
                                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                                touchAction: 'none',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={lightboxImages[lightboxIndex]}
                                alt="Car"
                                draggable={false}
                                style={{
                                    transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                                    userSelect: 'none'
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    if (zoomLevel > 1) {
                                        handleZoomReset();
                                    } else {
                                        setZoomLevel(2.5);
                                    }
                                }}
                            />
                        </div>

                        {lightboxImages.length > 1 && (
                            <>
                                <button
                                    className="lightbox-nav prev"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex(prev => prev === 0 ? lightboxImages.length - 1 : prev - 1);
                                    }}
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    className="lightbox-nav next"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex(prev => prev === lightboxImages.length - 1 ? 0 : prev + 1);
                                    }}
                                >
                                    <ChevronRight size={32} />
                                </button>

                                <div className="lightbox-counter">
                                    {lightboxIndex + 1} / {lightboxImages.length}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
