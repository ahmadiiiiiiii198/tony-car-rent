import { useState, useEffect, useCallback } from 'react';
import '../test-showcase.css';

interface CarData {
    id: number;
    brand: string;
    model: string;
    variant: string;
    price: string;
    location: string;
    year: number;
    mileage: string;
    horsepower: number;
    image: string;
    logoUrl: string;
}

const LOGOS: Record<string, string> = {
    porsche: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Porsche_logo.svg/180px-Porsche_logo.svg.png',
    ferrari: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/da/Ferrari_logo.svg/120px-Ferrari_logo.svg.png',
    lamborghini: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Lamborghini_Logo.svg/120px-Lamborghini_Logo.svg.png',
    mercedes: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Benz_Logo_2010.svg/150px-Mercedes-Benz_Logo_2010.svg.png',
    bmw: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/150px-BMW.svg.png',
    audi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/180px-Audi-Logo_2016.svg.png',
};

const cars: CarData[] = [
    {
        id: 1,
        brand: 'BMW',
        model: 'M8',
        variant: 'Competition',
        price: '$165,900',
        location: 'Firenze, IT',
        year: 2023,
        mileage: '1,900',
        horsepower: 625,
        image: '/cars/bmw-m8.png',
        logoUrl: LOGOS.bmw,
    },
    {
        id: 2,
        brand: 'Ferrari',
        model: 'Roma',
        variant: 'V8 Turbo',
        price: '$289,000',
        location: 'Roma, IT',
        year: 2021,
        mileage: '8,200',
        horsepower: 620,
        image: '/cars/ferrari-roma.png',
        logoUrl: LOGOS.ferrari,
    },
    {
        id: 3,
        brand: 'Porsche',
        model: '911',
        variant: 'GT3 RS',
        price: '$374,900',
        location: 'Miami, FL',
        year: 2016,
        mileage: '2,650',
        horsepower: 520,
        image: '/cars/porsche-911-turbo.png',
        logoUrl: LOGOS.porsche,
    },
    {
        id: 4,
        brand: 'Lamborghini',
        model: 'Huracán',
        variant: 'EVO Spyder',
        price: '$315,500',
        location: 'Torino, IT',
        year: 2022,
        mileage: '3,100',
        horsepower: 640,
        image: '/cars/lamborghini-huracan.png',
        logoUrl: LOGOS.lamborghini,
    },
    {
        id: 5,
        brand: 'Mercedes',
        model: 'AMG GT',
        variant: 'Black Series',
        price: '$198,700',
        location: 'Napoli, IT',
        year: 2020,
        mileage: '12,400',
        horsepower: 585,
        image: '/cars/mercedes-amg-gt.png',
        logoUrl: LOGOS.mercedes,
    },
    {
        id: 6,
        brand: 'Audi',
        model: 'R8',
        variant: 'V10 Performance',
        price: '$212,000',
        location: 'Bologna, IT',
        year: 2021,
        mileage: '5,600',
        horsepower: 570,
        image: '/cars/audi-r8.png',
        logoUrl: LOGOS.audi,
    },
];

export function TestCarShowcase() {
    const [currentIndex, setCurrentIndex] = useState(2); // Start at Porsche = "03"
    const [animState, setAnimState] = useState<'idle' | 'exit-up' | 'exit-down'>('idle');

    const car = cars[currentIndex];

    const navigate = useCallback((dir: 'up' | 'down') => {
        if (animState !== 'idle') return;
        setAnimState(dir === 'up' ? 'exit-up' : 'exit-down');
        setTimeout(() => {
            setCurrentIndex((prev) =>
                dir === 'up'
                    ? prev === 0 ? cars.length - 1 : prev - 1
                    : prev === cars.length - 1 ? 0 : prev + 1
            );
            setAnimState('idle');
        }, 450);
    }, [animState]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') navigate('up');
            if (e.key === 'ArrowDown') navigate('down');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [navigate]);

    useEffect(() => {
        let t: ReturnType<typeof setTimeout>;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            clearTimeout(t);
            t = setTimeout(() => {
                if (e.deltaY > 0) navigate('down');
                else if (e.deltaY < 0) navigate('up');
            }, 80);
        };
        window.addEventListener('wheel', onWheel, { passive: false });
        return () => window.removeEventListener('wheel', onWheel);
    }, [navigate]);

    const num = String(currentIndex + 1).padStart(2, '0');
    const a = animState === 'idle' ? 'tcs--in' : animState === 'exit-up' ? 'tcs--out-up' : 'tcs--out-down';
    const imgA = animState === 'idle' ? 'tcs--img-in' : animState === 'exit-up' ? 'tcs--img-out-l' : 'tcs--img-out-r';

    return (
        <div className="tcs">
            {/* Background warm glow */}
            <div className="tcs__glow" />

            {/* ─── BRAND LOGO (top-left) ─── */}
            <img
                className={`tcs__logo ${a}`}
                src={car.logoUrl}
                alt={car.brand}
                key={`logo-${car.id}`}
                draggable={false}
            />

            {/* ─── HEADER: name + price ─── */}
            <div className={`tcs__header ${a}`} key={`hdr-${car.id}`}>
                <div className="tcs__name">
                    <h1 className="tcs__title">{car.brand} {car.model}</h1>
                    <span className="tcs__variant">{car.variant}</span>
                </div>
                <div className="tcs__pricing">
                    <span className="tcs__price">{car.price}</span>
                    <span className="tcs__location">{car.location}</span>
                </div>
            </div>

            {/* ─── CAR IMAGE (center) ─── */}
            <img
                className={`tcs__car ${imgA}`}
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                key={`car-${car.id}`}
                draggable={false}
            />

            {/* ─── LEFT: arrows ─── */}
            <div className="tcs__nav">
                <button className="tcs__arr tcs__arr--up" onClick={() => navigate('up')} aria-label="Previous">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                </button>
                <button className="tcs__arr tcs__arr--dn" onClick={() => navigate('down')} aria-label="Next">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </div>

            {/* ─── BOTTOM-LEFT: counter ─── */}
            <span className="tcs__counter">{num}</span>

            {/* ─── BOTTOM: stats strip ─── */}
            <div className={`tcs__stats ${a}`} key={`stats-${car.id}`}>
                <div className="tcs__stat">
                    <strong>{car.year}</strong>
                    <small>Year</small>
                </div>
                <div className="tcs__stat">
                    <strong>{car.mileage}</strong>
                    <small>Mileage</small>
                </div>
                <div className="tcs__stat">
                    <strong>{car.horsepower}</strong>
                    <small>Horsepower</small>
                </div>
                <a className="tcs__details" href="#details">
                    Full details
                    <span className="tcs__details-arrow">→</span>
                </a>
            </div>
        </div>
    );
}
