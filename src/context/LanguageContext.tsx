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

    // Services
    ourServices: string;
    premiumExperience: string;
    servicesDesc: string;

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

        // Services
        ourServices: 'I Nostri Servizi',
        premiumExperience: 'Esperienza Premium',
        servicesDesc: 'Offriamo servizi esclusivi per rendere la tua esperienza indimenticabile.',

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

        // Services
        ourServices: 'Our Services',
        premiumExperience: 'Premium Experience',
        servicesDesc: 'We offer exclusive services to make your experience unforgettable.',

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
