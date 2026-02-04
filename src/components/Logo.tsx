import React from 'react';

export const Logo = ({ className = "h-12 w-auto" }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 400 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}  // Allow sizing via parent/props
            aria-label="Tonaydin Luxury Cars Logo"
        >
            <defs>
                <linearGradient id="silver-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E0E0E0" />
                    <stop offset="50%" stopColor="#B0B0B0" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
                <linearGradient id="gold-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="40%" stopColor="#F4CF57" />
                    <stop offset="60%" stopColor="#FFF5D6" />
                    <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
            </defs>

            {/* Icon Section - Abstract Piston/Fountain Shape */}
            <g transform="translate(130, 20)">
                {/* Central Vertical Lines */}

                {/* Right Side L-Shapes (Silver) */}
                <path d="M 70 80 L 70 20 L 90 20 L 90 30 L 80 30 L 80 80 Z" fill="url(#silver-gradient)" />
                <path d="M 60 100 L 60 35 L 85 35 L 85 45 L 70 45 L 70 100 Z" fill="url(#silver-gradient)" />
                <path d="M 50 120 L 50 50 L 80 50 L 80 60 L 60 60 L 60 120 Z" fill="url(#silver-gradient)" />

                {/* Left Side L-Shapes (Silver) - Mirrored */}
                <path d="M 40 80 L 40 20 L 20 20 L 20 30 L 30 30 L 30 80 Z" fill="url(#silver-gradient)" />
                <path d="M 50 100 L 50 35 L 25 35 L 25 45 L 40 45 L 40 100 Z" fill="url(#silver-gradient)" />
                <path d="M 60 120 L 60 50 L 30 50 L 30 60 L 50 60 L 50 120 Z" fill="url(#silver-gradient)" transform="scale(-1, 1) translate(-110, 0)" />

                {/* Correction for manual mirroring path logic */}
                <path d="M 40 120 L 40 50 L 10 50 L 10 60 L 30 60 L 30 120 Z" fill="url(#silver-gradient)" />

            </g>

            {/* Text: TONAYDIN */}
            <text
                x="200"
                y="180"
                textAnchor="middle"
                fontFamily="'Syncopate', sans-serif"
                fontWeight="bold"
                fontSize="42"
                fill="url(#gold-gradient)"
                letterSpacing="0.1em"
            >
                TONAYDIN
            </text>

            {/* Lines around Luxury Cars */}
            <line x1="40" y1="200" x2="110" y2="200" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="290" y1="200" x2="360" y2="200" stroke="#FFFFFF" strokeWidth="1" />

            {/* Text: LUXURY CARS 46 */}
            <text
                x="200"
                y="205"
                textAnchor="middle"
                fontFamily="'Outfit', sans-serif"
                fontSize="14"
                fill="#CCCCCC"
                letterSpacing="0.3em"
                fontWeight="300"
            >
                LUXURY CARS 46
            </text>
        </svg>
    );
};
