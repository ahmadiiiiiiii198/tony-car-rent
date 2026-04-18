import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'it' | 'en';

interface Translations {
    // Navigation
    home: string;
    fleet: string;
    services: string;
    about: string;
    contact: string;
    bookNow: string;

    // Hero
    driveThe: string;
    extraordinary: string;
    heroDesc: string;
    exploreFleet: string;
    selectCategoryToStart: string;

    // Hero Category Tabs
    tabUsedCars: string;
    tabRental: string;
    tabPerizia: string;
    tabNovita: string;
    tabAssistance: string;
    tabRecambi: string;
    tabImportazione: string;

    // Search Widget
    searchBrand: string;
    searchModel: string;
    searchPriceFrom: string;
    searchPriceTo: string;
    searchYearFrom: string;
    searchYearTo: string;
    searchMileageMax: string;
    searchFuel: string;
    searchButton: string;
    searchResults: string;
    searchAllBrands: string;
    searchAllModels: string;
    searchAllFuels: string;
    fuelPetrol: string;
    fuelDiesel: string;
    fuelHybrid: string;
    fuelElectric: string;
    fuelLPG: string;
    fuelCNG: string;

    // Category Descriptions
    usedCarsDesc: string;
    rentalDesc: string;
    periziaDesc: string;
    assistanceDesc: string;
    recambiDesc: string;
    importazioneDesc: string;

    // Commercial Subtypes
    commercialTrucks: string;
    commercialVans: string;
    commercialMinibuses: string;
    commercialMinivans: string;

    // Fleet Section
    ourFleet: string;
    chooseYour: string;
    dreamCar: string;
    fleetDesc: string;
    all: string;
    sports: string;
    grandTourer: string;
    supercar: string;
    perDay: string;
    notifyMe: string;
    comingSoon: string;
    seats: string;

    // Booking Modal
    details: string;
    extras: string;
    confirm: string;
    pickupDate: string;
    returnDate: string;
    pickupLocation: string;
    selectLocation: string;
    munichAirport: string;
    frankfurtAirport: string;
    berlinAirport: string;
    zurichAirport: string;
    milanAirport: string;
    romeAirport: string;
    veniceAirport: string;
    addExtras: string;
    premiumInsurance: string;
    professionalDriver: string;
    hotelDelivery: string;
    gpsNavigation: string;
    continue: string;
    back: string;
    done: string;
    bookingSummary: string;
    vehicle: string;
    pickup: string;
    return: string;
    location: string;
    notSelected: string;
    totalEstimated: string;
    confirmationMessage: string;

    // List Page / Fleet
    sortBy: string;
    sortRelevance: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortMileageAsc: string;
    sortYearDesc: string;
    filters: string;
    resetFilters: string;
    applyFilters: string;
    compare: string;
    compareCount: string;
    clearAll: string;
    selectToCompare: string;
    saveSearch: string;
    noResults: string;
    tryDifferentFilters: string;

    // Services
    ourServices: string;
    premiumExperience: string;
    servicesDesc: string;

    // Placeholders
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    messagePlaceholder: string;

    // Footer
    footerDesc: string;
    quickLinks: string;
    contactUs: string;
    privacyPolicy: string;
    termsConditions: string;
    allRightsReserved: string;
}

const translations: Record<Language, Translations> = {
    it: {
        // Navigation
        home: 'Home',
        fleet: 'Flotta',
        services: 'Servizi',
        about: 'Chi Siamo',
        contact: 'Contatti',
        bookNow: 'Prenota Ora',

        // Hero
        driveThe: 'Guida lo',
        extraordinary: 'Straordinario',
        heroDesc: 'Vivi l\'emozione della flotta più esclusiva al mondo. Servizio impeccabile, prestazioni senza pari.',
        exploreFleet: 'Esplora la Flotta',
        selectCategoryToStart: 'Seleziona una categoria per iniziare la ricerca',

        // Hero Category Tabs
        tabUsedCars: 'Vendita',
        tabRental: 'Noleggio',
        tabPerizia: 'Perizia',
        tabNovita: 'Novità',
        tabAssistance: 'Assistenza Stradale',
        tabRecambi: 'Ricambi',
        tabImportazione: 'Importazione',

        // Search Widget
        searchBrand: 'Marca',
        searchModel: 'Modello',
        searchPriceFrom: 'Prezzo da',
        searchPriceTo: 'Prezzo fino a',
        searchYearFrom: 'Anno da',
        searchYearTo: 'Anno fino a',
        searchMileageMax: 'Km massimi',
        searchFuel: 'Carburante',
        searchButton: 'Cerca Veicoli',
        searchResults: 'risultati',
        searchAllBrands: 'Tutte le marche',
        searchAllModels: 'Tutti i modelli',
        searchAllFuels: 'Tutti i carburanti',
        fuelPetrol: 'Benzina',
        fuelDiesel: 'Diesel',
        fuelHybrid: 'Ibrido',
        fuelElectric: 'Elettrico',
        fuelLPG: 'GPL',
        fuelCNG: 'Metano',

        // Category Descriptions
        usedCarsDesc: 'Scopri le nostre migliori opportunità di acquisto per veicoli certificati.',
        rentalDesc: 'Scegli l\'auto perfetta per il tuo prossimo viaggio o evento speciale.',
        periziaDesc: 'Valutazione professionale del tuo veicolo per vendita o permuta.',
        assistanceDesc: 'Supporto professionale 24/7 per ogni emergenza su strada.',
        recambiDesc: 'Ricambi originali e compatibili per ogni marca e modello. Richiedi un preventivo.',
        importazioneDesc: 'Importazione veicoli dall\'estero. Cerca l\'auto dei tuoi sogni e ci occupiamo di tutto noi.',

        // Commercial Subtypes
        commercialTrucks: 'Camion',
        commercialVans: 'Furgoni',
        commercialMinibuses: 'Pulmini',
        commercialMinivans: 'Minivan',

        // Fleet Section
        ourFleet: 'La Nostra Flotta',
        chooseYour: 'Scegli la tua',
        dreamCar: 'Auto dei Sogni',
        fleetDesc: 'Scopri l\'eccellenza dell\'automobilismo europeo con la nostra collezione curata di veicoli di lusso.',
        all: 'Tutti',
        sports: 'Sportive',
        grandTourer: 'Gran Turismo',
        supercar: 'Supercar',
        perDay: '/giorno',
        notifyMe: 'Avvisami',
        comingSoon: 'Prossimamente',
        seats: 'posti',

        // Booking Modal
        details: 'Dettagli',
        extras: 'Extra',
        confirm: 'Conferma',
        pickupDate: 'Data Ritiro',
        returnDate: 'Data Riconsegna',
        pickupLocation: 'Luogo di Ritiro',
        selectLocation: 'Seleziona luogo...',
        munichAirport: 'Aeroporto di Monaco (MUC)',
        frankfurtAirport: 'Aeroporto di Francoforte (FRA)',
        berlinAirport: 'Aeroporto di Berlino (BER)',
        zurichAirport: 'Aeroporto di Zurigo (ZRH)',
        milanAirport: 'Aeroporto di Milano Malpensa (MXP)',
        romeAirport: 'Aeroporto di Roma Fiumicino (FCO)',
        veniceAirport: 'Aeroporto di Venezia (VCE)',
        addExtras: 'Aggiungi Extra',
        premiumInsurance: 'Assicurazione Premium',
        professionalDriver: 'Autista Professionale',
        hotelDelivery: 'Consegna in Hotel',
        gpsNavigation: 'Navigatore GPS',
        continue: 'Continua',
        back: 'Indietro',
        done: 'Fatto',
        bookingSummary: 'Riepilogo Prenotazione',
        vehicle: 'Veicolo',
        pickup: 'Ritiro',
        return: 'Riconsegna',
        location: 'Luogo',
        notSelected: 'Non selezionato',
        totalEstimated: 'Totale (stimato)',
        confirmationMessage: 'Riceverai a breve un\'email di conferma. Il nostro team ti contatterà per finalizzare la prenotazione.',

        // List Page / Fleet
        sortBy: 'Ordina per',
        sortRelevance: 'Rilevanza',
        sortPriceAsc: 'Prezzo: dal più basso',
        sortPriceDesc: 'Prezzo: dal più alto',
        sortMileageAsc: 'Chilometraggio: dal più basso',
        sortYearDesc: 'Anno: dal più recente',
        filters: 'Filtri',
        resetFilters: 'Rimuovi filtri',
        applyFilters: 'Applica filtri',
        compare: 'Confronta',
        compareCount: 'veicoli selezionati',
        clearAll: 'Cancella tutto',
        selectToCompare: 'Seleziona almeno 2 veicoli da confrontare',
        saveSearch: 'Salva ricerca',
        noResults: 'Nessun veicolo trovato',
        tryDifferentFilters: 'Prova a modificare i filtri di ricerca',

        // Services
        ourServices: 'I Nostri Servizi',
        premiumExperience: 'Esperienza Premium',
        servicesDesc: 'Offriamo servizi esclusivi per rendere la tua esperienza indimenticabile.',

        // Placeholders
        namePlaceholder: 'Il tuo nome',
        emailPlaceholder: 'La tua email (opzionale)',
        phonePlaceholder: 'Il tuo telefono',
        messagePlaceholder: 'Il tuo messaggio',

        // Footer
        footerDesc: 'Tonaydin Luxury Cars offre una flotta d\'élite per chi esige il massimo e lo straordinario.',
        quickLinks: 'Link Rapidi',
        contactUs: 'Contattaci',
        privacyPolicy: 'Privacy Policy',
        termsConditions: 'Termini e Condizioni',
        allRightsReserved: 'Tutti i diritti riservati.',
    },
    en: {
        // Navigation
        home: 'Home',
        fleet: 'Fleet',
        services: 'Services',
        about: 'About',
        contact: 'Contact',
        bookNow: 'Book Now',

        // Hero
        driveThe: 'Drive the',
        extraordinary: 'Extraordinary',
        heroDesc: 'Experience the thrill of the world\'s most exclusive fleet. Impeccable service, unmatched performance.',
        exploreFleet: 'Explore Fleet',
        selectCategoryToStart: 'Select a category to start your search',

        // Hero Category Tabs
        tabUsedCars: 'Sales',
        tabRental: 'Rental',
        tabPerizia: 'Valuation',
        tabNovita: 'New',
        tabAssistance: 'Roadside Assistance',
        tabRecambi: 'Spare Parts',
        tabImportazione: 'Import',

        // Search Widget
        searchBrand: 'Brand',
        searchModel: 'Model',
        searchPriceFrom: 'Price from',
        searchPriceTo: 'Price up to',
        searchYearFrom: 'Year from',
        searchYearTo: 'Year up to',
        searchMileageMax: 'Max mileage',
        searchFuel: 'Fuel type',
        searchButton: 'Search Vehicles',
        searchResults: 'results',
        searchAllBrands: 'All brands',
        searchAllModels: 'All models',
        searchAllFuels: 'All fuel types',
        fuelPetrol: 'Petrol',
        fuelDiesel: 'Diesel',
        fuelHybrid: 'Hybrid',
        fuelElectric: 'Electric',
        fuelLPG: 'LPG',
        fuelCNG: 'CNG',

        // Category Descriptions
        usedCarsDesc: 'Explore our best luxury car purchase opportunities.',
        rentalDesc: 'Choose the perfect car for your next trip or special event.',
        periziaDesc: 'Professional valuation of your vehicle for sale or trade-in.',
        assistanceDesc: 'Professional 24/7 support for any roadside emergency.',
        recambiDesc: 'Original and compatible spare parts for every make and model. Request a quote.',
        importazioneDesc: 'Vehicle import from abroad. Search for your dream car and we\'ll handle everything.',

        // Commercial Subtypes
        commercialTrucks: 'Trucks',
        commercialVans: 'Vans',
        commercialMinibuses: 'Minibuses',
        commercialMinivans: 'Minivans',

        // Fleet Section
        ourFleet: 'Our Fleet',
        chooseYour: 'Choose Your',
        dreamCar: 'Dream Car',
        fleetDesc: 'Experience the pinnacle of European automotive excellence with our curated collection of luxury vehicles.',
        all: 'All',
        sports: 'Sports',
        grandTourer: 'Grand Tourer',
        supercar: 'Supercar',
        perDay: '/day',
        notifyMe: 'Notify Me',
        comingSoon: 'Coming Soon',
        seats: 'seats',

        // Booking Modal
        details: 'Details',
        extras: 'Extras',
        confirm: 'Confirm',
        pickupDate: 'Pickup Date',
        returnDate: 'Return Date',
        pickupLocation: 'Pickup Location',
        selectLocation: 'Select location...',
        munichAirport: 'Munich Airport (MUC)',
        frankfurtAirport: 'Frankfurt Airport (FRA)',
        berlinAirport: 'Berlin Airport (BER)',
        zurichAirport: 'Zurich Airport (ZRH)',
        milanAirport: 'Milan Malpensa (MXP)',
        romeAirport: 'Rome Fiumicino (FCO)',
        veniceAirport: 'Venice Airport (VCE)',
        addExtras: 'Add Extras',
        premiumInsurance: 'Premium Insurance',
        professionalDriver: 'Professional Driver',
        hotelDelivery: 'Hotel Delivery',
        gpsNavigation: 'GPS Navigation',
        continue: 'Continue',
        back: 'Back',
        done: 'Done',
        bookingSummary: 'Booking Summary',
        vehicle: 'Vehicle',
        pickup: 'Pickup',
        return: 'Return',
        location: 'Location',
        notSelected: 'Not selected',
        totalEstimated: 'Total (estimated)',
        confirmationMessage: 'A confirmation email will be sent to you shortly. Our team will contact you to finalize the booking.',

        // List Page / Fleet
        sortBy: 'Sort by',
        sortRelevance: 'Relevance',
        sortPriceAsc: 'Price: Low to High',
        sortPriceDesc: 'Price: High to Low',
        sortMileageAsc: 'Mileage: Low to High',
        sortYearDesc: 'Year: Newest',
        filters: 'Filters',
        resetFilters: 'Reset filters',
        applyFilters: 'Apply filters',
        compare: 'Compare',
        compareCount: 'vehicles selected',
        clearAll: 'Clear all',
        selectToCompare: 'Select at least 2 vehicles to compare',
        saveSearch: 'Save search',
        noResults: 'No vehicles found',
        tryDifferentFilters: 'Try adjusting your search filters',

        // Services
        ourServices: 'Our Services',
        premiumExperience: 'Premium Experience',
        servicesDesc: 'We offer exclusive services to make your experience unforgettable.',

        // Placeholders
        namePlaceholder: 'Your name',
        emailPlaceholder: 'Your email',
        phonePlaceholder: 'Your phone',
        messagePlaceholder: 'Your message',

        // Footer
        footerDesc: 'Tonaydin Luxury Cars provides an elite fleet of vehicles for those who demand the immense and the extraordinary.',
        quickLinks: 'Quick Links',
        contactUs: 'Contact Us',
        privacyPolicy: 'Privacy Policy',
        termsConditions: 'Terms & Conditions',
        allRightsReserved: 'All rights reserved.',
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('it'); // Italian as default

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
