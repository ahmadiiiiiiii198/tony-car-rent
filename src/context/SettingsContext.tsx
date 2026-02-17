
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SiteSettings {
    phone: string;
    email: string;
    address: string;
    instagram: string;
    whatsapp: string;
    heroVideo: string;
    heroTitle: string;
    heroSubtitle: string;
    heroTitleEn: string;
    heroSubtitleEn: string;
    periziaPlans?: PeriziaPlan[];
    periziaFeatures?: PeriziaFeature[];
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

const defaultSettings: SiteSettings = {
    phone: '+39 329 116 3843',
    email: 'tonaydineurasia.italy@gmail.com',
    address: 'Via per San Giorgio 70, Legnano (MI)',
    instagram: 'tonaydineurasia.italy',
    whatsapp: '+393291163843',
    heroVideo: '/bmw.mp4',
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
    ]
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
                setSettings({ ...defaultSettings, ...data.data });
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
