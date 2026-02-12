export interface SearchParams {
    brand: string;
    model: string;
    fuel: string;
    minPrice: number;
    maxPrice: number;
    listingType: 'all' | 'sale' | 'rental' | 'both';
    category: string;
}

export const emptySearchParams: SearchParams = {
    brand: '',
    model: '',
    fuel: '',
    minPrice: 0,
    maxPrice: 0,
    listingType: 'all',
    category: '',
};
