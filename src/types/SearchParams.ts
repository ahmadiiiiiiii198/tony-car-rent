export interface SearchParams {
    brand: string;
    model: string;
    fuel: string;
    minPrice: number;
    maxPrice: number;
    listingType: 'all' | 'sale' | 'rental' | 'both' | 'importazione';
    category: string;
    year?: number;
    km?: number;
    pickupDate?: string;
    returnDate?: string;

    // Advanced Filters
    bodyType?: string;
    fuelType?: string[];
    transmission?: string;
    driveType?: string; // 4x4 etc
    powerMin?: number;
    powerMax?: number;
    seatsMin?: number;
    seatsMax?: number;
    doors?: string; // "2/3", "4/5"
    color?: string[];
    interiorColor?: string[];
    interiorMaterial?: string[];
    features?: string[];
    sellerType?: 'all' | 'dealer' | 'private';
    condition?: ('new' | 'used' | 'demo' | 'km0' | 'classic')[];
    damaged?: boolean;
    warranty?: boolean;
    location?: string;
    radius?: number;

    // Ambiente
    emissionClass?: string;
    ecoBadge?: string;

    // Altre informazioni
    vatDeductible?: boolean;
}

export const emptySearchParams: SearchParams = {
    brand: '',
    model: '',
    fuel: '',
    minPrice: 0,
    maxPrice: 0,
    listingType: 'all',
    category: '',
    year: 0,
    km: 0,
    pickupDate: '',
    returnDate: '',
    fuelType: [],
    condition: [],
    features: [],
    color: [],
    interiorColor: [],
    interiorMaterial: [],
    emissionClass: '',
    ecoBadge: '',
    vatDeductible: false
};
