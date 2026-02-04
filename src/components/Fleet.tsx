import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Star, Fuel, Users, Gauge, X, Calendar, MapPin, Clock, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
}

const cars: Car[] = [
    // Budget Friendly (€80-150/day)
    {
        id: 1,
        name: 'Golf GTI',
        brand: 'Volkswagen',
        image: '/cars/vw-golf-gti.png',
        price: 95,
        specs: { power: '245 HP', seats: 5, fuel: 'Benzina', transmission: 'DSG' },
        category: 'Economy',
        rating: 4.7,
        available: true
    },
    {
        id: 2,
        name: 'Cooper S',
        brand: 'MINI',
        image: '/cars/mini-cooper-s.png',
        price: 85,
        specs: { power: '192 HP', seats: 4, fuel: 'Benzina', transmission: 'Auto' },
        category: 'Economy',
        rating: 4.6,
        available: true
    },
    {
        id: 3,
        name: 'A3 S-Line',
        brand: 'Audi',
        image: '/cars/audi-a3.png',
        price: 110,
        specs: { power: '150 HP', seats: 5, fuel: 'Benzina', transmission: 'S tronic' },
        category: 'Economy',
        rating: 4.7,
        available: true
    },
    {
        id: 4,
        name: '2 Series M Sport',
        brand: 'BMW',
        image: '/cars/bmw-2series.png',
        price: 120,
        specs: { power: '178 HP', seats: 5, fuel: 'Benzina', transmission: 'Auto' },
        category: 'Economy',
        rating: 4.8,
        available: true
    },
    // Mid-Range Luxury (€200-300/day)
    {
        id: 5,
        name: 'C63 AMG',
        brand: 'Mercedes-Benz',
        image: '/cars/mercedes-c63.png',
        price: 220,
        specs: { power: '476 HP', seats: 5, fuel: 'Benzina', transmission: 'Auto' },
        category: 'Luxury',
        rating: 4.8,
        available: true
    },
    {
        id: 6,
        name: 'M4 Competition',
        brand: 'BMW',
        image: '/cars/bmw-m4.png',
        price: 250,
        specs: { power: '510 HP', seats: 4, fuel: 'Benzina', transmission: 'Auto' },
        category: 'Sports',
        rating: 4.9,
        available: true
    },
    {
        id: 7,
        name: 'RS5 Sportback',
        brand: 'Audi',
        image: '/cars/audi-rs5.png',
        price: 280,
        specs: { power: '450 HP', seats: 5, fuel: 'Benzina', transmission: 'S tronic' },
        category: 'Luxury',
        rating: 4.8,
        available: true
    },
    {
        id: 8,
        name: 'Giulia Quadrifoglio',
        brand: 'Alfa Romeo',
        image: '/cars/alfa-giulia.png',
        price: 260,
        specs: { power: '510 HP', seats: 5, fuel: 'Benzina', transmission: 'Auto' },
        category: 'Sports',
        rating: 4.9,
        available: true
    },
    // Premium Sports (€300-500/day)
    {
        id: 9,
        name: 'AMG GT',
        brand: 'Mercedes-Benz',
        image: '/cars/mercedes-amg-gt.png',
        price: 450,
        specs: { power: '585 HP', seats: 2, fuel: 'Benzina', transmission: 'Auto' },
        category: 'Sports',
        rating: 4.9,
        available: true
    },
    {
        id: 10,
        name: '911 Turbo S',
        brand: 'Porsche',
        image: '/cars/porsche-911-turbo.png',
        price: 520,
        specs: { power: '650 HP', seats: 4, fuel: 'Benzina', transmission: 'PDK' },
        category: 'Sports',
        rating: 5.0,
        available: true
    },
    {
        id: 11,
        name: 'M8 Competition',
        brand: 'BMW',
        image: '/cars/bmw-m8.png',
        price: 380,
        specs: { power: '625 HP', seats: 4, fuel: 'Benzina', transmission: 'Auto' },
        category: 'Grand Tourer',
        rating: 4.8,
        available: true
    },
    {
        id: 12,
        name: 'R8 V10 Spyder',
        brand: 'Audi',
        image: '/cars/audi-r8.png',
        price: 550,
        specs: { power: '570 HP', seats: 2, fuel: 'Benzina', transmission: 'S tronic' },
        category: 'Supercar',
        rating: 4.8,
        available: true
    },
    // Supercars (€600+/day)
    {
        id: 13,
        name: 'Huracán EVO',
        brand: 'Lamborghini',
        image: '/cars/lamborghini-huracan.png',
        price: 850,
        specs: { power: '640 HP', seats: 2, fuel: 'Benzina', transmission: 'DCT' },
        category: 'Supercar',
        rating: 5.0,
        available: true
    },
    {
        id: 14,
        name: 'Roma',
        brand: 'Ferrari',
        image: '/cars/ferrari-roma.png',
        price: 780,
        specs: { power: '620 HP', seats: 2, fuel: 'Benzina', transmission: 'DCT' },
        category: 'Grand Tourer',
        rating: 4.9,
        available: false
    }
];

export const Fleet = () => {
    const { t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [bookingStep, setBookingStep] = useState(0);
    const [bookingData, setBookingData] = useState({
        pickupDate: '',
        returnDate: '',
        pickupLocation: '',
        extras: [] as string[]
    });

    const categories = [
        { key: 'All', label: t.all },
        { key: 'Economy', label: 'Economy' },
        { key: 'Luxury', label: 'Luxury' },
        { key: 'Sports', label: t.sports },
        { key: 'Grand Tourer', label: t.grandTourer },
        { key: 'Supercar', label: t.supercar }
    ];

    const filteredCars = selectedCategory === 'All'
        ? cars
        : cars.filter(car => car.category === selectedCategory);

    const handleBook = (car: Car) => {
        setSelectedCar(car);
        setBookingStep(1);
    };

    const closeModal = () => {
        setSelectedCar(null);
        setBookingStep(0);
        setBookingData({ pickupDate: '', returnDate: '', pickupLocation: '', extras: [] });
    };

    const nextStep = () => setBookingStep(prev => prev + 1);
    const prevStep = () => setBookingStep(prev => prev - 1);

    const getLocationName = (value: string) => {
        const locations: Record<string, string> = {
            munich: t.munichAirport,
            frankfurt: t.frankfurtAirport,
            berlin: t.berlinAirport,
            zurich: t.zurichAirport,
            milan: t.milanAirport,
            rome: t.romeAirport,
            venice: t.veniceAirport
        };
        return locations[value] || t.notSelected;
    };

    const extras = [
        { id: 'insurance', name: t.premiumInsurance, price: 50 },
        { id: 'driver', name: t.professionalDriver, price: 200 },
        { id: 'delivery', name: t.hotelDelivery, price: 75 },
        { id: 'gps', name: t.gpsNavigation, price: 15 }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, rotateY: -10 },
        visible: {
            opacity: 1,
            y: 0,
            rotateY: 0,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <section className="fleet-section" id="fleet">
            {/* Racing stripes background */}
            <div className="racing-stripes">
                <div className="stripe"></div>
                <div className="stripe"></div>
            </div>

            <div className="container">
                <motion.div
                    className="fleet-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <motion.span
                        className="section-tag"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                        {t.ourFleet}
                    </motion.span>
                    <h2 className="section-title">
                        <motion.span
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            {t.chooseYour}
                        </motion.span>{' '}
                        <motion.span
                            className="text-gold"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            {t.dreamCar}
                        </motion.span>
                    </h2>
                    <motion.p
                        className="section-desc"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                    >
                        {t.fleetDesc}
                    </motion.p>

                    {/* Speedometer decoration */}
                    <motion.div
                        className="speedometer-decoration"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.6 }}
                    >
                        <div className="speedo-ring"></div>
                        <div className="speedo-needle"></div>
                    </motion.div>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    className="category-filter"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    {categories.map((cat, index) => (
                        <motion.button
                            key={cat.key}
                            className={`filter-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.key)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {cat.label}
                            {selectedCategory === cat.key && (
                                <motion.div
                                    className="filter-indicator"
                                    layoutId="activeFilter"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Cars Grid */}
                <motion.div
                    className="cars-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredCars.map((car) => (
                            <motion.div
                                key={car.id}
                                className="car-card"
                                variants={cardVariants}
                                layout
                                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                                whileHover={{
                                    y: -15,
                                    scale: 1.02,
                                    boxShadow: "0 30px 60px rgba(212, 175, 55, 0.15)"
                                }}
                            >
                                <div className="car-image-wrapper">
                                    <motion.img
                                        src={car.image}
                                        alt={`${car.brand} ${car.name}`}
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                    <div className="car-category-badge">
                                        {car.category}
                                    </div>
                                    {!car.available && <div className="unavailable-badge">{t.comingSoon}</div>}

                                    {/* Headlight effect on hover */}
                                    <div className="headlight-effect"></div>
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
                                        <motion.div
                                            className="spec"
                                            whileHover={{ scale: 1.1, color: "var(--color-gold)" }}
                                        >
                                            <Gauge size={16} />
                                            <span>{car.specs.power}</span>
                                        </motion.div>
                                        <motion.div
                                            className="spec"
                                            whileHover={{ scale: 1.1, color: "var(--color-gold)" }}
                                        >
                                            <Users size={16} />
                                            <span>{car.specs.seats} {t.seats}</span>
                                        </motion.div>
                                        <motion.div
                                            className="spec"
                                            whileHover={{ scale: 1.1, color: "var(--color-gold)" }}
                                        >
                                            <Fuel size={16} />
                                            <span>{car.specs.fuel}</span>
                                        </motion.div>
                                    </div>

                                    <div className="car-footer">
                                        <div className="car-price">
                                            <motion.span
                                                className="price"
                                                initial={{ scale: 1 }}
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                €{car.price}
                                            </motion.span>
                                            <span className="per-day">{t.perDay}</span>
                                        </div>
                                        <motion.button
                                            className="book-btn"
                                            whileHover={{
                                                scale: 1.05,
                                                background: "linear-gradient(135deg, var(--color-gold), #FFD700)"
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleBook(car)}
                                            disabled={!car.available}
                                        >
                                            {car.available ? t.bookNow : t.notifyMe}
                                            <motion.span
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <ChevronRight size={16} />
                                            </motion.span>
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Tire track effect */}
                                <div className="tire-track"></div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Booking Modal */}
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
                            initial={{ opacity: 0, scale: 0.8, y: 100, rotateX: -15 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 100, rotateX: 15 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <motion.button
                                className="close-modal"
                                onClick={closeModal}
                                whileHover={{ rotate: 90, scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X size={24} />
                            </motion.button>

                            {/* Progress Steps */}
                            <div className="booking-progress">
                                {[1, 2, 3].map(step => (
                                    <motion.div
                                        key={step}
                                        className={`progress-step ${bookingStep >= step ? 'active' : ''} ${bookingStep > step ? 'completed' : ''}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: step * 0.1 }}
                                    >
                                        <motion.div
                                            className="step-number"
                                            whileHover={{ scale: 1.1 }}
                                            animate={bookingStep === step ? {
                                                scale: [1, 1.1, 1],
                                                boxShadow: ["0 0 0 0 rgba(212, 175, 55, 0.4)", "0 0 0 10px rgba(212, 175, 55, 0)", "0 0 0 0 rgba(212, 175, 55, 0)"]
                                            } : {}}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            {bookingStep > step ? <Check size={16} /> : step}
                                        </motion.div>
                                        <span className="step-label">
                                            {step === 1 ? t.details : step === 2 ? t.extras : t.confirm}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Step 1: Booking Details */}
                            {bookingStep === 1 && (
                                <motion.div
                                    className="booking-step"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                >
                                    <motion.div
                                        className="selected-car-preview"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <motion.img
                                            src={selectedCar.image}
                                            alt={selectedCar.name}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        />
                                        <div>
                                            <h3>{selectedCar.brand} {selectedCar.name}</h3>
                                            <motion.p
                                                className="text-gold"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                €{selectedCar.price}{t.perDay}
                                            </motion.p>
                                        </div>
                                    </motion.div>

                                    <div className="booking-form">
                                        <div className="form-group">
                                            <label><Calendar size={16} /> {t.pickupDate}</label>
                                            <input
                                                type="date"
                                                value={bookingData.pickupDate}
                                                onChange={e => setBookingData({ ...bookingData, pickupDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><Clock size={16} /> {t.returnDate}</label>
                                            <input
                                                type="date"
                                                value={bookingData.returnDate}
                                                onChange={e => setBookingData({ ...bookingData, returnDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group full-width">
                                            <label><MapPin size={16} /> {t.pickupLocation}</label>
                                            <select
                                                value={bookingData.pickupLocation}
                                                onChange={e => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                                            >
                                                <option value="">{t.selectLocation}</option>
                                                <option value="milan">{t.milanAirport}</option>
                                                <option value="rome">{t.romeAirport}</option>
                                                <option value="venice">{t.veniceAirport}</option>
                                                <option value="munich">{t.munichAirport}</option>
                                                <option value="frankfurt">{t.frankfurtAirport}</option>
                                                <option value="berlin">{t.berlinAirport}</option>
                                                <option value="zurich">{t.zurichAirport}</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Extras */}
                            {bookingStep === 2 && (
                                <motion.div
                                    className="booking-step"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                >
                                    <h3>{t.addExtras}</h3>
                                    <div className="extras-grid">
                                        {extras.map((extra, index) => (
                                            <motion.label
                                                key={extra.id}
                                                className={`extra-option ${bookingData.extras.includes(extra.id) ? 'selected' : ''}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={bookingData.extras.includes(extra.id)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setBookingData({ ...bookingData, extras: [...bookingData.extras, extra.id] });
                                                        } else {
                                                            setBookingData({ ...bookingData, extras: bookingData.extras.filter(x => x !== extra.id) });
                                                        }
                                                    }}
                                                />
                                                <div className="extra-info">
                                                    <span className="extra-name">{extra.name}</span>
                                                    <span className="extra-price">+€{extra.price}{t.perDay}</span>
                                                </div>
                                                <motion.div
                                                    className="extra-checkbox"
                                                    animate={bookingData.extras.includes(extra.id) ? { scale: [1, 1.2, 1] } : {}}
                                                >
                                                    {bookingData.extras.includes(extra.id) && <Check size={16} />}
                                                </motion.div>
                                            </motion.label>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Confirmation */}
                            {bookingStep === 3 && (
                                <motion.div
                                    className="booking-step confirmation"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <motion.div
                                        className="confirmation-icon"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        <Check size={48} />
                                    </motion.div>
                                    <h3>{t.bookingSummary}</h3>
                                    <motion.div
                                        className="summary-card"
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="summary-row">
                                            <span>{t.vehicle}</span>
                                            <span>{selectedCar.brand} {selectedCar.name}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>{t.pickup}</span>
                                            <span>{bookingData.pickupDate || t.notSelected}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>{t.return}</span>
                                            <span>{bookingData.returnDate || t.notSelected}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>{t.location}</span>
                                            <span>{getLocationName(bookingData.pickupLocation)}</span>
                                        </div>
                                        <div className="summary-divider"></div>
                                        <motion.div
                                            className="summary-row total"
                                            animate={{ scale: [1, 1.02, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <span>{t.totalEstimated}</span>
                                            <span className="text-gold">€{selectedCar.price * 3}</span>
                                        </motion.div>
                                    </motion.div>
                                    <p className="disclaimer">
                                        {t.confirmationMessage}
                                    </p>
                                </motion.div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="booking-nav">
                                {bookingStep > 1 && bookingStep < 3 && (
                                    <motion.button
                                        className="btn-secondary"
                                        onClick={prevStep}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {t.back}
                                    </motion.button>
                                )}
                                {bookingStep < 3 && (
                                    <motion.button
                                        className="btn-primary"
                                        onClick={nextStep}
                                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)" }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {t.continue} <ChevronRight size={18} />
                                    </motion.button>
                                )}
                                {bookingStep === 3 && (
                                    <motion.button
                                        className="btn-primary"
                                        onClick={closeModal}
                                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)" }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {t.done} <Check size={18} />
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
