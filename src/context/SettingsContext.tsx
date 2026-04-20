
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ColorOption {
    name: string;
    hex: string;
}

export interface ConditionOption {
    value: string;
    label: string;
}

export interface SearchFormConfig {
    exteriorColors: ColorOption[];
    interiorColors: ColorOption[];
    materials: string[];
    features: string[];
    conditions: ConditionOption[];
    doorOptions: string[];
    emissionClasses: string[];
    ecoBadgeLevels: string[];
}

interface SiteSettings {
    phone: string;
    email: string;
    address: string;
    instagram: string;
    whatsapp: string;
    heroVideo: string;
    heroPoster: string;
    heroTitle: string;
    heroSubtitle: string;
    heroTitleEn: string;
    heroSubtitleEn: string;
    periziaPlans?: PeriziaPlan[];
    periziaFeatures?: PeriziaFeature[];
    searchFormConfig?: SearchFormConfig;
    assistancePricePerKm?: number;
    assistancePhone?: string;
}

export interface PeriziaPlan {
    id: string;
    name: string;
    price: string;
    features: string[]; // List of feature IDs included
    highlight?: boolean;
}

export interface PeriziaFeature {
    id: string;
    label: string;
}

const defaultSearchFormConfig: SearchFormConfig = {
    exteriorColors: [
        { name: 'Beige', hex: '#D2B48C' },
        { name: 'Blu/Azzurro', hex: '#1E3A8A' },
        { name: 'Marrone', hex: '#8B4513' },
        { name: 'Bronzo', hex: '#CD7F32' },
        { name: 'Giallo', hex: '#EAB308' },
        { name: 'Grigio', hex: '#9CA3AF' },
        { name: 'Verde', hex: '#16A34A' },
        { name: 'Rosso', hex: '#DC2626' },
        { name: 'Nero', hex: '#111111' },
        { name: 'Argento', hex: '#C0C0C0' },
        { name: 'Lilla', hex: '#9333EA' },
        { name: 'Bianco', hex: '#F5F5F5' },
        { name: 'Arancione', hex: '#EA580C' },
        { name: 'Oro', hex: '#D4AF37' },
    ],
    interiorColors: [
        { name: 'Beige', hex: '#D2B48C' },
        { name: 'Nero', hex: '#111111' },
        { name: 'Grigio', hex: '#9CA3AF' },
        { name: 'Marrone', hex: '#8B4513' },
        { name: 'Altro', hex: '#6B7280' },
        { name: 'Blu/Azzurro', hex: '#1E3A8A' },
        { name: 'Rosso', hex: '#DC2626' },
        { name: 'Verde', hex: '#16A34A' },
        { name: 'Giallo', hex: '#EAB308' },
        { name: 'Arancione', hex: '#EA580C' },
        { name: 'Bianco', hex: '#F5F5F5' },
    ],
    materials: [
        'Alcantara',
        'Stoffa',
        'Pelle totale',
        'Altro',
        'Pelle parziale',
        'Pelle scamosciata',
    ],
    features: [
        'ABS',
        'Climatizzatore',
        'Climatizzatore automatico',
        'Cruise Control',
        'Adaptive Cruise Control',
        'Fari LED',
        'Fari Xenon',
        'Navigatore',
        'Sensori di parcheggio',
        'Telecamera posteriore',
        'Sedili riscaldati',
        'Trazione integrale',
        'Volante multifunzione',
        'Tettuccio apribile',
        'Interni in pelle',
    ],
    conditions: [
        { value: 'new', label: 'Nuovo' },
        { value: 'used', label: 'Usato' },
        { value: 'classic', label: 'Epoca' },
        { value: 'demo', label: 'Dimostrativo' },
        { value: 'km0', label: 'KM0' },
    ],
    doorOptions: ['2/3', '4/5', '6/7'],
    emissionClasses: ['Euro 1', 'Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6'],
    ecoBadgeLevels: ['2', '3', '4', '5'],
};

const defaultSettings: SiteSettings = {
    phone: '+39 329 116 3843',
    email: 'tonaydineurasia.italy@gmail.com',
    address: 'Via per San Giorgio 70, Legnano (MI)',
    instagram: 'tonaydineurasia.italy',
    whatsapp: '+393291163843',
    heroVideo: '/bmw.mp4',
    heroPoster: '/hero.png',
    heroTitle: 'TONAYDIN LUXURY CARS',
    heroSubtitle: 'Luxury Lifestyle. Exceptional Service.',
    heroTitleEn: 'TONAYDIN LUXURY CARS',
    heroSubtitleEn: 'Luxury Lifestyle. Exceptional Service.',
    periziaFeatures: [
        { id: 'motore', label: 'Perizia Motore' },
        { id: 'meccanica', label: 'Perizia Meccanica' },
        { id: 'carrozzeria', label: 'Carrozzeria e Verniciatura' },
        { id: 'obd', label: 'Diagnosi OBD e Centralina' },
        { id: 'elettronica', label: 'Elettronica Interna ed Esterna' },
        { id: 'km', label: 'Verifica Chilometraggio Realistico' },
        { id: 'sinistri', label: 'Cronologia Sinistri e Danni' },
        { id: 'freni', label: 'Test Impianto Frenante' },
        { id: 'sospensioni', label: 'Test Sospensioni e Assetto' },
        { id: 'deriva', label: 'Test Deriva Laterale' },
        { id: 'dyno', label: 'Test di Potenza (Dyno)' },
        { id: 'perdite', label: 'Verifica Perdite Liquidi' },
        { id: 'dettagli', label: 'Analisi Dettagliata Veicolo' },
        { id: 'sostituzioni', label: 'Verifica Parti Sostituite' },
        { id: 'gravami', label: 'Verifica Gravami e Fermo Amministrativo' },
        { id: 'assistenza', label: 'Assistenza Stradale Inclusa' },
        { id: 'prova', label: 'Prova su Strada (Test Drive)' }
    ],
    periziaPlans: [
        { id: '1', name: 'Base', price: '99', features: ['motore', 'meccanica', 'carrozzeria'] },
        { id: '2', name: 'Premium', price: '199', features: ['motore', 'meccanica', 'carrozzeria', 'obd', 'elettronica', 'km'], highlight: true },
        { id: '3', name: 'Full', price: '299', features: ['motore', 'meccanica', 'carrozzeria', 'obd', 'elettronica', 'km', 'sinistri', 'freni', 'sospensioni', 'assistenza', 'prova'] }
    ],
    searchFormConfig: defaultSearchFormConfig,
    assistancePricePerKm: 2.5,
    assistancePhone: '800 123 456'
};

interface SettingsContextType {
    settings: SiteSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('data')
                .eq('id', 'main')
                .single();

            if (data && !error) {
                const merged = { ...defaultSettings, ...data.data };
                // Ensure searchFormConfig is deeply merged with defaults
                merged.searchFormConfig = {
                    ...defaultSearchFormConfig,
                    ...(data.data.searchFormConfig || {})
                };
                setSettings(merged);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
