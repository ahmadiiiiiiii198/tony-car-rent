
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
}

const defaultSettings: SiteSettings = {
    phone: '+39 329 116 3843',
    email: 'tonaydineurasia.italy@gmail.com',
    address: 'Via per San Giorgio 70, Legnano (MI)',
    instagram: 'tonaydineurasia.italy',
    whatsapp: '+393291163843',
    heroVideo: '/luxury-car-bg.mp4',
    heroTitle: 'TONAYDIN LUXURY CARS',
    heroSubtitle: 'Luxury Lifestyle. Exceptional Service.'
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
