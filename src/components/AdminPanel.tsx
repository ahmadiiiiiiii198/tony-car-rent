
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
    ShieldCheck, LogOut, Clock, CheckCircle, Package,
    Mail, Phone, Car as CarIcon, Calendar, Search, RefreshCw,
    ChevronDown, ChevronUp, MessageSquare, Trash2, ArrowLeft,
    Plus, Edit, Save, X, Upload, LayoutGrid, Settings as SettingsIcon,
    Fuel, Users, Gauge,
    Award, Palette, Wand2, Shield
} from 'lucide-react';
import { useSettings, type SearchFormConfig, type ColorOption, type ConditionOption } from '../context/SettingsContext';
import { CarImageEditor } from './CarImageEditor';

interface Order {
    id: string;
    car_id: number | null;
    car_name: string;
    car_brand: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    order_type: 'purchase' | 'rental' | 'info';
    message: string | null;
    status: 'pending' | 'confirmed' | 'rejected' | 'completed';
    created_at: string;
    updated_at: string;
}

interface Car {
    id: number;
    name: string;
    brand: string;
    image: string;
    price: number;
    power: string;
    seats: number;
    fuel: string;
    transmission: string;
    category: string;
    rating: number;
    available: boolean;
    year: number | null;
    km: string | null;
    euro_standard: string | null;
    description: string | null;
    listing_type: 'sale' | 'rental' | 'both';
    images: string[];
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'tonaydin2026';

const CAR_BRANDS_AND_MODELS: Record<string, string[]> = {
    'Abarth': ['595', '695', '124 Spider'],
    'Alfa Romeo': ['Giulia', 'Stelvio', '4C', '8C', 'Tonale'],
    'Aston Martin': ['DB11', 'DB12', 'DBS Superleggera', 'Vantage', 'DBX', 'Vanquish', 'Valhalla', 'Valkyrie'],
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RS Q3', 'RS Q8', 'e-tron', 'e-tron GT'],
    'Bentley': ['Bentayga', 'Continental GT', 'Flying Spur', 'Mulsanne'],
    'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 6', 'Serie 7', 'Serie 8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'M2', 'M3', 'M4', 'M5', 'M8', 'Z4', 'iX', 'i4', 'i7', 'XM'],
    'Bugatti': ['Chiron', 'Veyron', 'Divo', 'Bolide', 'Centodieci', 'Mistral'],
    'Chevrolet': ['Camaro', 'Corvette'],
    'Cupra': ['Formentor', 'Leon', 'Ateca', 'Born'],
    'Dodge': ['Challenger', 'Charger', 'Durango', 'Viper'],
    'Ferrari': ['296 GTB', '296 GTS', '488 GTB', '488 Spider', '488 Pista', '812 Superfast', '812 GTS', '812 Competizione', 'F8 Tributo', 'F8 Spider', 'SF90 Stradale', 'SF90 Spider', 'Roma', 'Portofino', 'Portofino M', 'Monza SP1', 'Monza SP2', 'Daytona SP3', 'Purosangue', 'LaFerrari', 'Enzo', 'F40', 'F50', 'GTC4Lusso'],
    'Ford': ['Mustang', 'Bronco', 'GT', 'Raptor'],
    'Jaguar': ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'XE', 'XF'],
    'Jeep': ['Avenger', 'Compass', 'Grand Cherokee', 'Renegade', 'Wrangler', 'Gladiator'],
    'Koenigsegg': ['Agera', 'Jesko', 'Gemera', 'Regera'],
    'Lamborghini': ['Aventador', 'Huracán', 'Urus', 'Revuelto', 'Gallardo', 'Murciélago', 'Diablo', 'Countach', 'Sian'],
    'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
    'Lexus': ['ES', 'IS', 'LC', 'LS', 'NX', 'RX', 'UX', 'LFA'],
    'Lotus': ['Emira', 'Evora', 'Eletre', 'Evija', 'Exige'],
    'Maserati': ['Ghibli', 'Grecale', 'Levante', 'Quattroporte', 'MC20', 'MC20 Cielo', 'GranTurismo', 'GranCabrio'],
    'McLaren': ['720S', '750S', '765LT', 'Artura', 'GT', 'P1', 'Senna', 'Speedtail', 'Elva', '600LT', '675LT', '570S'],
    'Mercedes-Benz': ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'Classe G', 'Classe S', 'Classe V', 'CLA', 'CLE', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'SL', 'AMG GT', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'Maybach'],
    'Mini': ['Clubman', 'Countryman', 'Cooper'],
    'Pagani': ['Zonda', 'Huayra', 'Utopia'],
    'Porsche': ['718 Boxster', '718 Cayman', '911', '918 Spyder', 'Carrera GT', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
    'Rolls-Royce': ['Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Wraith', 'Spectre'],
    'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
    'Toyota': ['GR Yaris', 'GR86', 'Supra', 'Land Cruiser'],
    'Volvo': ['EX30', 'EX90', 'XC40', 'XC60', 'XC90', 'V60', 'V90'],
    'Altro': ['Altro Modello']
};

// ====================================================================
// Search Form Configuration Editor Component
// ====================================================================

interface SearchFormEditorProps {
    siteSettings: any;
    setSiteSettings: (s: any) => void;
    savingSettings: boolean;
    setSavingSettings: (b: boolean) => void;
    refreshSettings: () => Promise<void>;
}

const SearchFormEditor = ({ siteSettings, setSiteSettings, savingSettings, setSavingSettings, refreshSettings }: SearchFormEditorProps) => {
    const config: SearchFormConfig = siteSettings.searchFormConfig || {
        exteriorColors: [], interiorColors: [], materials: [], features: [],
        conditions: [], doorOptions: [], emissionClasses: [], ecoBadgeLevels: []
    };

    const updateConfig = (patch: Partial<SearchFormConfig>) => {
        setSiteSettings({
            ...siteSettings,
            searchFormConfig: { ...config, ...patch }
        });
    };

    const handleSave = async () => {
        setSavingSettings(true);
        const { error } = await supabase
            .from('site_settings')
            .update({ data: siteSettings, updated_at: new Date().toISOString() })
            .eq('id', 'main');

        if (!error) {
            await refreshSettings();
            alert('Configurazione ricerca salvata con successo!');
        } else {
            alert('Errore nel salvataggio: ' + error.message);
        }
        setSavingSettings(false);
    };

    // --- Color list editor helper ---
    const ColorListEditor = ({ label, colors, onChange }: { label: string; colors: ColorOption[]; onChange: (c: ColorOption[]) => void }) => {
        const [newName, setNewName] = useState('');
        const [newHex, setNewHex] = useState('#888888');

        return (
            <div className="search-config-card">
                <h4><Palette size={18} /> {label}</h4>
                <div className="search-config-items">
                    {colors.map((c, i) => (
                        <div key={i} className="search-config-item color-item">
                            <input
                                type="color"
                                value={c.hex}
                                onChange={e => {
                                    const updated = [...colors];
                                    updated[i] = { ...c, hex: e.target.value };
                                    onChange(updated);
                                }}
                                className="color-picker-input"
                            />
                            <input
                                type="text"
                                value={c.name}
                                onChange={e => {
                                    const updated = [...colors];
                                    updated[i] = { ...c, name: e.target.value };
                                    onChange(updated);
                                }}
                                className="admin-input-sm"
                            />
                            <span className="color-hex-label">{c.hex}</span>
                            <button type="button" className="remove-item-btn" onClick={() => onChange(colors.filter((_, idx) => idx !== i))}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="add-item-row">
                    <input type="color" value={newHex} onChange={e => setNewHex(e.target.value)} className="color-picker-input" />
                    <input type="text" placeholder="Nome colore" value={newName} onChange={e => setNewName(e.target.value)} className="admin-input-sm" />
                    <button type="button" className="add-item-btn" onClick={() => {
                        if (newName.trim()) {
                            onChange([...colors, { name: newName.trim(), hex: newHex }]);
                            setNewName('');
                            setNewHex('#888888');
                        }
                    }}>
                        <Plus size={14} /> Aggiungi
                    </button>
                </div>
            </div>
        );
    };

    // --- Simple string list editor ---
    const StringListEditor = ({ label, icon, items, onChange }: { label: string; icon: React.ReactNode; items: string[]; onChange: (items: string[]) => void }) => {
        const [newItem, setNewItem] = useState('');

        return (
            <div className="search-config-card">
                <h4>{icon} {label}</h4>
                <div className="search-config-items">
                    {items.map((item, i) => (
                        <div key={i} className="search-config-item">
                            <input
                                type="text"
                                value={item}
                                onChange={e => {
                                    const updated = [...items];
                                    updated[i] = e.target.value;
                                    onChange(updated);
                                }}
                                className="admin-input-sm"
                            />
                            <button type="button" className="remove-item-btn" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="add-item-row">
                    <input type="text" placeholder={`Nuovo ${label.toLowerCase()}`} value={newItem} onChange={e => setNewItem(e.target.value)} className="admin-input-sm"
                        onKeyDown={e => {
                            if (e.key === 'Enter' && newItem.trim()) {
                                e.preventDefault();
                                onChange([...items, newItem.trim()]);
                                setNewItem('');
                            }
                        }}
                    />
                    <button type="button" className="add-item-btn" onClick={() => {
                        if (newItem.trim()) {
                            onChange([...items, newItem.trim()]);
                            setNewItem('');
                        }
                    }}>
                        <Plus size={14} /> Aggiungi
                    </button>
                </div>
            </div>
        );
    };

    // --- Condition list editor ---
    const ConditionListEditor = ({ conditions, onChange }: { conditions: ConditionOption[]; onChange: (c: ConditionOption[]) => void }) => {
        const [newValue, setNewValue] = useState('');
        const [newLabel, setNewLabel] = useState('');

        return (
            <div className="search-config-card">
                <h4><Award size={18} /> Condizioni Veicolo</h4>
                <div className="search-config-items">
                    {conditions.map((c, i) => (
                        <div key={i} className="search-config-item">
                            <input
                                type="text"
                                value={c.value}
                                onChange={e => {
                                    const updated = [...conditions];
                                    updated[i] = { ...c, value: e.target.value };
                                    onChange(updated);
                                }}
                                className="admin-input-sm"
                                placeholder="Valore (es: new)"
                            />
                            <input
                                type="text"
                                value={c.label}
                                onChange={e => {
                                    const updated = [...conditions];
                                    updated[i] = { ...c, label: e.target.value };
                                    onChange(updated);
                                }}
                                className="admin-input-sm"
                                placeholder="Etichetta (es: Nuovo)"
                            />
                            <button type="button" className="remove-item-btn" onClick={() => onChange(conditions.filter((_, idx) => idx !== i))}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="add-item-row">
                    <input type="text" placeholder="Valore" value={newValue} onChange={e => setNewValue(e.target.value)} className="admin-input-sm" />
                    <input type="text" placeholder="Etichetta" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="admin-input-sm" />
                    <button type="button" className="add-item-btn" onClick={() => {
                        if (newValue.trim() && newLabel.trim()) {
                            onChange([...conditions, { value: newValue.trim(), label: newLabel.trim() }]);
                            setNewValue('');
                            setNewLabel('');
                        }
                    }}>
                        <Plus size={14} /> Aggiungi
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-content-section">
            <div className="section-header">
                <div>
                    <h2>Configurazione Ricerca</h2>
                    <p>Gestisci tutte le opzioni del modulo di ricerca avanzata.</p>
                </div>
                <button className="admin-add-btn" onClick={handleSave} disabled={savingSettings}>
                    {savingSettings ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                    Salva Modifiche
                </button>
            </div>

            <div className="search-config-grid">
                <ColorListEditor
                    label="Colori Esterni"
                    colors={config.exteriorColors}
                    onChange={c => updateConfig({ exteriorColors: c })}
                />
                <ColorListEditor
                    label="Colori Interni"
                    colors={config.interiorColors}
                    onChange={c => updateConfig({ interiorColors: c })}
                />
                <StringListEditor
                    label="Materiali Interni"
                    icon={<CarIcon size={18} />}
                    items={config.materials}
                    onChange={items => updateConfig({ materials: items })}
                />
                <StringListEditor
                    label="Dotazioni / Features"
                    icon={<CheckCircle size={18} />}
                    items={config.features}
                    onChange={items => updateConfig({ features: items })}
                />
                <ConditionListEditor
                    conditions={config.conditions}
                    onChange={c => updateConfig({ conditions: c })}
                />
                <StringListEditor
                    label="Opzioni Porte"
                    icon={<CarIcon size={18} />}
                    items={config.doorOptions}
                    onChange={items => updateConfig({ doorOptions: items })}
                />
                <StringListEditor
                    label="Classi Emissioni"
                    icon={<Fuel size={18} />}
                    items={config.emissionClasses}
                    onChange={items => updateConfig({ emissionClasses: items })}
                />
                <StringListEditor
                    label="Bollini Ambientali"
                    icon={<Award size={18} />}
                    items={config.ecoBadgeLevels}
                    onChange={items => updateConfig({ ecoBadgeLevels: items })}
                />
            </div>
        </div>
    );
};

// ====================================================================

const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#22c55e',
    rejected: '#ef4444',
    completed: '#3b82f6'
};

const statusLabels: Record<string, string> = {
    pending: 'In Attesa',
    confirmed: 'Confermato',
    rejected: 'Rifiutato',
    completed: 'Completato'
};

const orderTypeLabels: Record<string, string> = {
    purchase: 'Acquisto',
    rental: 'Noleggio',
    info: 'Informazioni'
};

export const AdminPanel = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [activeTab, setActiveTab] = useState<'orders' | 'fleet' | 'settings' | 'search'>('orders');

    // Orders State
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, confirmed: 0, rejected: 0, completed: 0 });

    const { settings: currentSettings, refreshSettings } = useSettings();
    const [siteSettings, setSiteSettings] = useState(currentSettings);
    const [savingSettings, setSavingSettings] = useState(false);

    // Fleet State
    const [cars, setCars] = useState<Car[]>([]);
    const [loadingCars, setLoadingCars] = useState(false);
    const [editingCar, setEditingCar] = useState<Car | null>(null);
    const [showCarModal, setShowCarModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const multiFileInputRef = useRef<HTMLInputElement>(null);

    // Image Editor State
    const [imageEditorFile, setImageEditorFile] = useState<File | null>(null);
    const [imageEditorIsMain, setImageEditorIsMain] = useState(true);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingIsMain, setPendingIsMain] = useState(true);

    useEffect(() => {
        const saved = sessionStorage.getItem('admin_auth');
        if (saved === 'true') setAuthenticated(true);
    }, []);

    useEffect(() => {
        if (authenticated) {
            fetchOrders();
            fetchCars();
            // Sync local state with global settings on auth
            setSiteSettings(currentSettings);
            const interval = setInterval(fetchOrders, 30000);
            return () => clearInterval(interval);
        }
    }, [authenticated, currentSettings]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setAuthenticated(true);
            sessionStorage.setItem('admin_auth', 'true');
            setPasswordError('');
        } else {
            setPasswordError('Password errata');
        }
    };

    const handleLogout = () => {
        setAuthenticated(false);
        sessionStorage.removeItem('admin_auth');
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrders(data);
            setOrderStats({
                total: data.length,
                pending: data.filter(o => o.status === 'pending').length,
                confirmed: data.filter(o => o.status === 'confirmed').length,
                rejected: data.filter(o => o.status === 'rejected').length,
                completed: data.filter(o => o.status === 'completed').length
            });
        }
        setLoadingOrders(false);
    };

    const fetchCars = async () => {
        setLoadingCars(true);
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .order('id', { ascending: false });

        if (!error && data) {
            setCars(data);
        }
        setLoadingCars(false);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', orderId);

        if (!error) {
            fetchOrders();
        }
    };

    const deleteOrder = async (orderId: string) => {
        if (!confirm('Sei sicuro di voler eliminare questo ordine?')) return;
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (!error) {
            fetchOrders();
        }
    };

    // Fleet Management Functions
    const handleSaveCar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCar) return;

        setLoadingCars(true);
        // Remove ID from the data we send to Supabase to prevent "cannot insert a non-DEFAULT value" errors
        const { id, ...carDataToSave } = editingCar;

        const isNew = !id;

        let error;
        if (isNew) {
            const { error: insertError } = await supabase.from('cars').insert([carDataToSave]);
            error = insertError;
        } else {
            const { error: updateError } = await supabase.from('cars').update(carDataToSave).eq('id', id);
            error = updateError;
        }

        if (error) {
            alert('Errore durante il salvataggio: ' + error.message);
        } else {
            setShowCarModal(false);
            setEditingCar(null);
            fetchCars();
        }
        setLoadingCars(false);
    };

    const handleDeleteCar = async (id: number) => {
        if (!confirm('Sei sicuro di voler eliminare questo veicolo?')) return;
        const { error } = await supabase.from('cars').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchCars();
    };

    const handleUploadClick = () => fileInputRef.current?.click();
    const handleMultiUploadClick = () => multiFileInputRef.current?.click();

    const openImageEditor = (file: File, isMain: boolean) => {
        setImageEditorFile(file);
        setImageEditorIsMain(isMain);
        setPendingFile(null);
    };

    const handleFileSelected = (file: File, isMain: boolean) => {
        setPendingFile(file);
        setPendingIsMain(isMain);
    };

    const uploadDirect = async (file: File, isMain: boolean) => {
        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `cars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('car-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('car-images')
                .getPublicUrl(filePath);

            if (isMain) {
                setEditingCar(prev => prev ? { ...prev, image: publicUrl } : null);
            } else {
                setEditingCar(prev => prev ? { ...prev, images: [...(prev.images || []), publicUrl] } : null);
            }
        } catch (error: any) {
            alert('Errore caricamento: ' + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const uploadBlob = async (blob: Blob, isMain: boolean) => {
        setUploadingImage(true);
        try {
            const fileName = `${Math.random()}.png`;
            const filePath = `cars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('car-images')
                .upload(filePath, blob, { contentType: 'image/png' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('car-images')
                .getPublicUrl(filePath);

            if (isMain) {
                setEditingCar(prev => prev ? { ...prev, image: publicUrl } : null);
            } else {
                setEditingCar(prev => prev ? { ...prev, images: [...(prev.images || []), publicUrl] } : null);
            }
        } catch (error: any) {
            alert('Errore caricamento: ' + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageEditorComplete = async (blob: Blob) => {
        const isMain = imageEditorIsMain;
        setImageEditorFile(null);
        await uploadBlob(blob, isMain);
    };

    const handleImageEditorCancel = () => {
        setImageEditorFile(null);
    };

    const filteredOrders = orders.filter(o => {
        if (filterStatus !== 'all' && o.status !== filterStatus) return false;
        if (filterType !== 'all' && o.order_type !== filterType) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                o.customer_name.toLowerCase().includes(q) ||
                o.customer_email.toLowerCase().includes(q) ||
                o.customer_phone.includes(q) ||
                o.car_name.toLowerCase().includes(q) ||
                o.car_brand.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('it-IT', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Login Screen
    if (!authenticated) {
        return (
            <div className="admin-login-page">
                <div className="admin-login-card">
                    <div className="admin-login-header">
                        <ShieldCheck size={48} />
                        <h1>Admin Panel</h1>
                        <p>Tonaydin Luxury Cars</p>
                    </div>
                    <form onSubmit={handleLogin} className="admin-login-form">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="admin-input"
                            autoFocus
                        />
                        {passwordError && <p className="admin-error">{passwordError}</p>}
                        <button type="submit" className="admin-login-btn">
                            <ShieldCheck size={18} /> Accedi
                        </button>
                    </form>
                    <a href="/" className="admin-back-link">
                        <ArrowLeft size={16} /> Torna al sito
                    </a>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="admin-page">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-header-left">
                        <ShieldCheck size={24} className="text-gold" />
                        <h1>Dashboard</h1>
                    </div>

                    <nav className="admin-main-nav">
                        <button
                            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <MessageSquare size={18} /> <span>Richieste</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'fleet' ? 'active' : ''}`}
                            onClick={() => setActiveTab('fleet')}
                        >
                            <LayoutGrid size={18} /> <span>Flotta</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
                            onClick={() => setActiveTab('search')}
                        >
                            <Search size={18} /> <span>Ricerca</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <SettingsIcon size={18} /> <span>Impostazioni</span>
                        </button>
                    </nav>

                    <div className="admin-header-right">
                        <a href="/" className="admin-site-link">
                            <ArrowLeft size={16} /> <span className="mobile-hidden">Sito</span>
                        </a>
                        <button onClick={handleLogout} className="admin-logout-btn">
                            <LogOut size={16} /> <span className="mobile-hidden">Esci</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-container">
                {activeTab === 'orders' && (
                    <div className="admin-content-section">
                        {/* Order Stats */}
                        <div className="admin-stats">
                            <div className="stat-card" onClick={() => setFilterStatus('all')}>
                                <Package size={24} />
                                <div>
                                    <span className="stat-number">{orderStats.total}</span>
                                    <span className="stat-label">Totale</span>
                                </div>
                            </div>
                            <div className="stat-card stat-pending" onClick={() => setFilterStatus('pending')}>
                                <Clock size={24} />
                                <div>
                                    <span className="stat-number">{orderStats.pending}</span>
                                    <span className="stat-label">In Attesa</span>
                                </div>
                            </div>
                            <div className="stat-card stat-confirmed" onClick={() => setFilterStatus('confirmed')}>
                                <CheckCircle size={24} />
                                <div>
                                    <span className="stat-number">{orderStats.confirmed}</span>
                                    <span className="stat-label">Confermati</span>
                                </div>
                            </div>
                            <div className="stat-card stat-completed" onClick={() => setFilterStatus('completed')}>
                                <Package size={24} />
                                <div>
                                    <span className="stat-number">{orderStats.completed}</span>
                                    <span className="stat-label">Completati</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Filters */}
                        <div className="admin-filters">
                            <div className="admin-search">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Cerca richieste..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="admin-filter-group">
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="admin-select">
                                    <option value="all">Tutti gli stati</option>
                                    <option value="pending">In Attesa</option>
                                    <option value="confirmed">Confermati</option>
                                    <option value="rejected">Rifiutati</option>
                                    <option value="completed">Completati</option>
                                </select>
                            </div>
                        </div>

                        {/* Order List */}
                        <div className="admin-orders">
                            {loadingOrders && <div className="admin-loading"><RefreshCw size={32} className="spin" /></div>}
                            {filteredOrders.map(order => (
                                <div key={order.id} className={`admin-order-card ${order.status}`}>
                                    <div className="order-card-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                        <div className="order-card-left">
                                            <span className="order-status-dot" style={{ background: statusColors[order.status] }} />
                                            <div className="order-card-info">
                                                <h4>{order.customer_name}</h4>
                                                <p className="order-car-info"><CarIcon size={14} /> {order.car_brand} {order.car_name}</p>
                                            </div>
                                        </div>
                                        <div className="order-card-right">
                                            <span className="order-status-badge" style={{ color: statusColors[order.status], borderColor: statusColors[order.status] }}>
                                                {statusLabels[order.status]}
                                            </span>
                                            <span className="order-type-badge">{orderTypeLabels[order.order_type]}</span>
                                            <span className="order-date"><Calendar size={12} /> {formatDate(order.created_at)}</span>
                                            {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>
                                    {expandedOrder === order.id && (
                                        <div className="order-card-details">
                                            <div className="order-detail-grid">
                                                <div className="order-detail-item"><Mail size={16} /> <span>{order.customer_email}</span></div>
                                                <div className="order-detail-item"><Phone size={16} /> <span>{order.customer_phone}</span></div>
                                            </div>
                                            {order.message && (
                                                <div className="order-message">
                                                    <MessageSquare size={16} />
                                                    <p>{order.message}</p>
                                                </div>
                                            )}
                                            <div className="order-actions">
                                                <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="action-status-btn confirmed">Conferma</button>
                                                <button onClick={() => updateOrderStatus(order.id, 'completed')} className="action-status-btn completed">Completa</button>
                                                <button onClick={() => updateOrderStatus(order.id, 'rejected')} className="action-status-btn rejected">Rifiuta</button>
                                                <button onClick={() => deleteOrder(order.id)} className="action-status-btn delete"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'fleet' && (
                    <div className="admin-content-section">
                        <div className="section-header">
                            <div>
                                <h2>Gestione Flotta</h2>
                                <p>Aggiungi e modifica i veicoli disponibili nel catalogo.</p>
                            </div>
                            <button className="admin-add-btn" onClick={() => {
                                setEditingCar({
                                    id: 0,
                                    name: '',
                                    brand: '',
                                    image: '',
                                    price: 0,
                                    power: '',
                                    seats: 4,
                                    fuel: 'Benzina',
                                    transmission: 'Automatico',
                                    category: 'Sports',
                                    rating: 5,
                                    available: true,
                                    year: new Date().getFullYear(),
                                    km: '0',
                                    euro_standard: 'Euro 6',
                                    description: '',
                                    listing_type: 'rental',
                                    images: []
                                });
                                setShowCarModal(true);
                            }}>
                                <Plus size={18} /> Aggiungi Auto
                            </button>
                        </div>

                        <div className="admin-fleet-grid">
                            {cars.map(car => (
                                <div key={car.id} className="admin-car-card">
                                    <div className="car-card-img">
                                        <img src={car.image || '/hero.png'} alt={car.name} />
                                        {!car.available && <span className="unavailable-badge">Non Disponibile</span>}
                                    </div>
                                    <div className="car-card-content">
                                        <div className="car-card-header">
                                            <div>
                                                <h3>{car.brand} {car.name}</h3>
                                                <p>{car.year} • {car.km} km</p>
                                            </div>
                                            <div className="car-price">€{car.price}</div>
                                        </div>
                                        <div className="car-card-actions">
                                            <button className="car-action-btn edit" onClick={() => {
                                                setEditingCar({ ...car });
                                                setShowCarModal(true);
                                            }}>
                                                <Edit size={16} /> Modifica
                                            </button>
                                            <button className="car-action-btn delete" onClick={() => handleDeleteCar(car.id)}>
                                                <Trash2 size={16} /> Elimina
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="admin-content-section">
                        <div className="section-header">
                            <div>
                                <h2>Impostazioni Sito</h2>
                                <p>Gestisci le informazioni di contatto e i contenuti globali del sito.</p>
                            </div>
                            <button
                                className="admin-add-btn"
                                onClick={async () => {
                                    setSavingSettings(true);
                                    const { error } = await supabase
                                        .from('site_settings')
                                        .update({ data: siteSettings, updated_at: new Date().toISOString() })
                                        .eq('id', 'main');

                                    if (!error) {
                                        await refreshSettings();
                                        alert('Impostazioni salvate con successo!');
                                    } else {
                                        alert('Errore nel salvataggio: ' + error.message);
                                    }
                                    setSavingSettings(false);
                                }}
                                disabled={savingSettings}
                            >
                                {savingSettings ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                                Salva Modifiche
                            </button>
                        </div>

                        <div className="settings-grid">
                            <div className="settings-card">
                                <h3><Phone size={20} /> Contatti & Social</h3>
                                <div className="form-group">
                                    <label>Telefono</label>
                                    <input value={siteSettings.phone} onChange={e => setSiteSettings({ ...siteSettings, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input value={siteSettings.email} onChange={e => setSiteSettings({ ...siteSettings, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Indirizzo</label>
                                    <input value={siteSettings.address} onChange={e => setSiteSettings({ ...siteSettings, address: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Instagram User</label>
                                        <input value={siteSettings.instagram} onChange={e => setSiteSettings({ ...siteSettings, instagram: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>WhatsApp (con prefisso)</label>
                                        <input value={siteSettings.whatsapp} onChange={e => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="settings-card">
                                <h3><CarIcon size={20} /> Sezione Hero</h3>
                                <div className="form-group">
                                    <label>Video URL (Sfondo)</label>
                                    <input value={siteSettings.heroVideo} onChange={e => setSiteSettings({ ...siteSettings, heroVideo: e.target.value })} />
                                    <small style={{ color: '#888', marginTop: '4px' }}>Inserisci un link diretto a un file .mp4</small>
                                </div>
                                <div className="form-group">
                                    <label>Titolo Hero</label>
                                    <input value={siteSettings.heroTitle} onChange={e => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Sottotitolo Hero</label>
                                    <input value={siteSettings.heroSubtitle} onChange={e => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })} />
                                </div>
                            </div>

                            <div className="settings-card">
                                <h3><Shield size={20} /> Assistenza Stradale</h3>
                                <p className="settings-desc">Configura i numeri di contatto e il prezzo per km dell'assistenza stradale.</p>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Numero Verde</label>
                                        <input value={siteSettings.assistancePhone || ''} onChange={e => setSiteSettings({ ...siteSettings, assistancePhone: e.target.value })} placeholder="800 123 456" />
                                        <small style={{ color: '#888', marginTop: '4px' }}>Numero verde gratuito mostrato nel pannello.</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Cellulare 24/7</label>
                                        <input value={siteSettings.phone || ''} onChange={e => setSiteSettings({ ...siteSettings, phone: e.target.value })} placeholder="+39 329 116 3843" />
                                        <small style={{ color: '#888', marginTop: '4px' }}>Numero di cellulare mostrato accanto al numero verde.</small>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Prezzo per KM (€)</label>
                                    <input type="number" step="0.1" min="0" value={siteSettings.assistancePricePerKm || ''} onChange={e => setSiteSettings({ ...siteSettings, assistancePricePerKm: parseFloat(e.target.value) || 0 })} placeholder="2.50" />
                                    <small style={{ color: '#888', marginTop: '4px' }}>Il prezzo verrà moltiplicato per i km inseriti dal cliente per calcolare il preventivo.</small>
                                </div>
                            </div>

                            <div className="settings-card full-width">
                                <h3><Award size={20} /> Piani Perizia / Valutazione</h3>
                                <p className="settings-desc">Configura i pacchetti di perizia tecnica e i prezzi relativi.</p>
                                <div className="perizia-plans-editor">
                                    {siteSettings.periziaPlans?.map((plan, pIdx) => (
                                        <div key={plan.id} className="perizia-plan-config">
                                            <div className="plan-header">
                                                <input
                                                    value={plan.name}
                                                    onChange={e => {
                                                        const newPlans = (siteSettings.periziaPlans || []).map((p, i) =>
                                                            i === pIdx ? { ...p, name: e.target.value } : p
                                                        );
                                                        setSiteSettings({ ...siteSettings, periziaPlans: newPlans });
                                                    }}
                                                    placeholder="Nome Piano"
                                                />
                                                <div className="plan-price-input">
                                                    <span>€</span>
                                                    <input
                                                        value={plan.price}
                                                        onChange={e => {
                                                            const newPlans = (siteSettings.periziaPlans || []).map((p, i) =>
                                                                i === pIdx ? { ...p, price: e.target.value } : p
                                                            );
                                                            setSiteSettings({ ...siteSettings, periziaPlans: newPlans });
                                                        }}
                                                        placeholder="Prezzo"
                                                    />
                                                </div>
                                                <label className="plan-highlight-toggle" title="Evidenzia come Consigliato">
                                                    <input
                                                        type="checkbox"
                                                        checked={plan.highlight || false}
                                                        onChange={e => {
                                                            const newPlans = (siteSettings.periziaPlans || []).map((p, i) =>
                                                                i === pIdx ? { ...p, highlight: e.target.checked } : p
                                                            );
                                                            setSiteSettings({ ...siteSettings, periziaPlans: newPlans });
                                                        }}
                                                    />
                                                    <Award size={16} className={plan.highlight ? 'text-gold' : 'text-muted'} />
                                                </label>
                                            </div>
                                            <div className="plan-features-toggle">
                                                {siteSettings.periziaFeatures?.map(feat => (
                                                    <label key={feat.id} className="feature-toggle">
                                                        <input
                                                            type="checkbox"
                                                            checked={plan.features.includes(feat.id)}
                                                            onChange={e => {
                                                                const newPlans = (siteSettings.periziaPlans || []).map((p, i) => {
                                                                    if (i !== pIdx) return p;
                                                                    const newFeatures = e.target.checked
                                                                        ? [...p.features, feat.id]
                                                                        : p.features.filter(id => id !== feat.id);
                                                                    return { ...p, features: newFeatures };
                                                                });
                                                                setSiteSettings({ ...siteSettings, periziaPlans: newPlans });
                                                            }}
                                                        />
                                                        {feat.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'search' && (
                    <SearchFormEditor siteSettings={siteSettings} setSiteSettings={setSiteSettings} savingSettings={savingSettings} setSavingSettings={setSavingSettings} refreshSettings={refreshSettings} />
                )}
            </div>

            {/* Upload Choice Prompt */}
            {pendingFile && !imageEditorFile && (
                <div className="img-editor-overlay">
                    <div className="upload-choice-modal">
                        <div className="upload-choice-header">
                            <Upload size={28} />
                            <h3>Come vuoi caricare l'immagine?</h3>
                        </div>
                        <div className="upload-choice-options">
                            <button
                                className="upload-choice-btn direct"
                                onClick={async () => {
                                    const file = pendingFile;
                                    const isMain = pendingIsMain;
                                    setPendingFile(null);
                                    await uploadDirect(file, isMain);
                                }}
                            >
                                <Upload size={22} />
                                <span className="upload-choice-title">Carica Direttamente</span>
                                <span className="upload-choice-desc">Usa l'immagine originale senza modifiche</span>
                            </button>
                            <button
                                className="upload-choice-btn editor"
                                onClick={() => openImageEditor(pendingFile, pendingIsMain)}
                            >
                                <Wand2 size={22} />
                                <span className="upload-choice-title">Modifica Sfondo</span>
                                <span className="upload-choice-desc">Rimuovi lo sfondo e applicane uno nuovo con l'AI</span>
                            </button>
                        </div>
                        <button className="upload-choice-cancel" onClick={() => setPendingFile(null)}>
                            Annulla
                        </button>
                    </div>
                </div>
            )}

            {/* Image Editor Modal */}
            {imageEditorFile && (
                <CarImageEditor
                    file={imageEditorFile}
                    onComplete={handleImageEditorComplete}
                    onCancel={handleImageEditorCancel}
                />
            )}

            {/* Car Editor Modal — Subito-style full-page form */}
            {showCarModal && editingCar && (
                <div className="admin-modal-overlay car-editor-overlay">
                    <div className="admin-modal car-editor-modal">
                        <div className="modal-header car-editor-header">
                            <h3>{editingCar.id ? 'Modifica Veicolo' : 'Nuovo Veicolo'}</h3>
                            <button onClick={() => { setShowCarModal(false); setEditingCar(null); }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveCar} className="car-editor-form">
                            {/* ── SECTION: Immagini ── */}
                            <div className="ce-section">
                                <div className="ce-section-title">
                                    <span>Immagini</span>
                                    <span className="ce-counter">{(editingCar.image ? 1 : 0) + (editingCar.images?.length || 0)}/6</span>
                                </div>
                                <p className="ce-hint">Trascina per riordinare o clicca per ingrandire</p>
                                <div className="ce-image-grid">
                                    {/* Main image slot */}
                                    <div className={`ce-image-slot ce-main-slot ${editingCar.image ? 'has-image' : ''}`} onClick={handleUploadClick}>
                                        {editingCar.image ? (
                                            <>
                                                <img src={editingCar.image} alt="Principale" />
                                                <div className="ce-slot-overlay">
                                                    <Upload size={18} />
                                                    <span>Cambia</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="ce-slot-empty">
                                                <Plus size={24} className="ce-camera-icon" />
                                                <span>Aggiungi foto</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={e => { if (e.target.files?.[0]) { handleFileSelected(e.target.files[0], true); e.target.value = ''; } }} />

                                    {/* Gallery image slots (up to 5 more) */}
                                    {Array.from({ length: 5 }).map((_, idx) => {
                                        const img = editingCar.images?.[idx];
                                        return (
                                            <div key={idx} className={`ce-image-slot ${img ? 'has-image' : ''}`} onClick={() => { if (!img) handleMultiUploadClick(); }}>
                                                {img ? (
                                                    <>
                                                        <img src={img} alt="" />
                                                        <button type="button" className="ce-slot-remove" onClick={e => { e.stopPropagation(); setEditingCar({ ...editingCar, images: editingCar.images.filter((_, i) => i !== idx) }); }}>
                                                            <X size={12} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="ce-slot-empty">
                                                        <CarIcon size={20} className="ce-camera-placeholder" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <input type="file" ref={multiFileInputRef} hidden accept="image/*" onChange={e => { if (e.target.files?.[0]) { handleFileSelected(e.target.files[0], false); e.target.value = ''; } }} />
                                </div>
                                {uploadingImage && <p className="ce-uploading-text"><RefreshCw size={14} className="spin" /> Caricamento in corso...</p>}
                            </div>

                            {/* ── SECTION: Titolo (Modello) ── */}
                            <div className="ce-section">
                                <div className="ce-section-title">
                                    <span>Titolo</span>
                                    <span className="ce-counter">{(editingCar.name?.length || 0)}/50</span>
                                </div>
                                {editingCar.brand === 'Altro' ? (
                                    <input
                                        className="ce-input"
                                        required
                                        maxLength={50}
                                        value={editingCar.name}
                                        onChange={e => setEditingCar({ ...editingCar, name: e.target.value })}
                                        placeholder="Scrivi il nome del veicolo"
                                    />
                                ) : (
                                    <select className="ce-select" required value={editingCar.name} onChange={e => setEditingCar({ ...editingCar, name: e.target.value })}>
                                        <option value="" disabled>Seleziona Modello</option>
                                        {(CAR_BRANDS_AND_MODELS[editingCar.brand] || [editingCar.name]).map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* ── SECTION: Descrizione ── */}
                            <div className="ce-section">
                                <div className="ce-section-title">
                                    <span>Descrizione</span>
                                    <span className="ce-counter">{(editingCar.description?.length || 0)}/2000</span>
                                </div>
                                <textarea
                                    className="ce-textarea"
                                    maxLength={2000}
                                    value={editingCar.description || ''}
                                    onChange={e => setEditingCar({ ...editingCar, description: e.target.value })}
                                    rows={5}
                                    placeholder="Inserisci dettagli e caratteristiche del veicolo."
                                />
                            </div>

                            {/* ── SECTION: Marca ── */}
                            <div className="ce-section">
                                <div className="ce-section-title"><span>Marca</span></div>
                                <select className="ce-select" required value={editingCar.brand} onChange={e => {
                                    const newBrand = e.target.value;
                                    const availableModels = CAR_BRANDS_AND_MODELS[newBrand] || [];
                                    setEditingCar({
                                        ...editingCar,
                                        brand: newBrand,
                                        name: availableModels.length > 0 ? availableModels[0] : ''
                                    });
                                }}>
                                    <option value="" disabled>Seleziona la marca</option>
                                    {Object.keys(CAR_BRANDS_AND_MODELS).sort().map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ── SECTION: Chilometraggio ── */}
                            <div className="ce-section">
                                <div className="ce-section-title"><span>Chilometraggio (km)</span></div>
                                <input
                                    className="ce-input"
                                    value={editingCar.km || ''}
                                    onChange={e => setEditingCar({ ...editingCar, km: e.target.value })}
                                    placeholder="Inserisci il chilometraggio"
                                />
                            </div>

                            {/* ── SECTION: Anno di immatricolazione ── */}
                            <div className="ce-section">
                                <div className="ce-section-title"><span>Anno di immatricolazione</span></div>
                                <select className="ce-select" value={editingCar.year || ''} onChange={e => setEditingCar({ ...editingCar, year: Number(e.target.value) })}>
                                    <option value="" disabled>Seleziona l'anno di immatricolazione</option>
                                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ── SECTION: Carburante ── */}
                            <div className="ce-section">
                                <div className="ce-section-title">
                                    <span>Carburante</span>
                                    <span className="ce-optional">opzionale</span>
                                </div>
                                <select className="ce-select" value={editingCar.fuel} onChange={e => setEditingCar({ ...editingCar, fuel: e.target.value })}>
                                    <option value="" disabled>Seleziona la tipologia di carburante</option>
                                    <option value="Benzina">Benzina</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Elettrica">Elettrica</option>
                                    <option value="Ibrida">Ibrida</option>
                                    <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                                    <option value="GPL">GPL</option>
                                    <option value="Metano">Metano</option>
                                </select>
                            </div>

                            {/* ── SECTION: Carrozzeria (Categoria) ── */}
                            <div className="ce-section">
                                <div className="ce-section-title">
                                    <span>Carrozzeria</span>
                                    <span className="ce-optional">opzionale</span>
                                </div>
                                <select className="ce-select" value={editingCar.category} onChange={e => setEditingCar({ ...editingCar, category: e.target.value })}>
                                    <option value="" disabled>Seleziona la carrozzeria</option>
                                    <option value="Sports">Sportive</option>
                                    <option value="Supercar">Supercar</option>
                                    <option value="Hypercar">Hypercar</option>
                                    <option value="SUV">SUV</option>
                                    <option value="LUXURY">Luxury</option>
                                    <option value="Berlina">Berlina</option>
                                    <option value="Cabriolet">Cabrio / Spider</option>
                                    <option value="Coupe">Coupé</option>
                                    <option value="GT">Gran Turismo (GT)</option>
                                    <option value="Station Wagon">Station Wagon</option>
                                    <option value="Classic">Epoca / Classic</option>
                                    <option value="Van">Van / Minivan</option>
                                </select>
                            </div>

                            {/* ── SECTION: Cambio ── */}
                            <div className="ce-section">
                                <div className="ce-section-title">
                                    <span>Cambio</span>
                                    <span className="ce-optional">opzionale</span>
                                </div>
                                <select className="ce-select" value={editingCar.transmission || 'Automatico'} onChange={e => setEditingCar({ ...editingCar, transmission: e.target.value })}>
                                    <option value="" disabled>Seleziona il tipo di cambio</option>
                                    <option value="Automatico">Automatico</option>
                                    <option value="Manuale">Manuale</option>
                                    <option value="Semiautomatico">Semiautomatico</option>
                                </select>
                            </div>

                            {/* ── SECTION: Classe emissioni ── */}
                            <div className="ce-section">
                                <div className="ce-section-title">
                                    <span>Classe emissioni</span>
                                    <span className="ce-optional">opzionale</span>
                                </div>
                                <select className="ce-select" value={editingCar.euro_standard || ''} onChange={e => setEditingCar({ ...editingCar, euro_standard: e.target.value })}>
                                    <option value="" disabled>Seleziona la classe di emissioni</option>
                                    <option value="Euro 6">Euro 6</option>
                                    <option value="Euro 5">Euro 5</option>
                                    <option value="Euro 4">Euro 4</option>
                                    <option value="Euro 3">Euro 3</option>
                                    <option value="Euro 2">Euro 2</option>
                                    <option value="Euro 1">Euro 1</option>
                                    <option value="Euro 0">Euro 0</option>
                                </select>
                            </div>

                            {/* ── SECTION: Posti ── */}
                            <div className="ce-section">
                                <div className="ce-section-title">
                                    <span>Posti</span>
                                    <span className="ce-optional">opzionale</span>
                                </div>
                                <select className="ce-select" value={editingCar.seats} onChange={e => setEditingCar({ ...editingCar, seats: Number(e.target.value) })}>
                                    <option value="" disabled>Seleziona il numero di posti</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ── SECTION: Potenza ── */}
                            <div className="ce-section">
                                <div className="ce-section-title">
                                    <span>Potenza (CV)</span>
                                    <span className="ce-optional">opzionale</span>
                                </div>
                                <input
                                    className="ce-input"
                                    value={editingCar.power}
                                    onChange={e => setEditingCar({ ...editingCar, power: e.target.value })}
                                    placeholder="Inserisci la potenza in CV"
                                />
                            </div>

                            {/* ── SECTION: Prezzo ── */}
                            <div className="ce-section">
                                <div className="ce-section-title"><span>Prezzo</span></div>
                                <div className="ce-prefixed-input">
                                    <span className="ce-prefix">€</span>
                                    <input
                                        className="ce-input ce-input-prefixed"
                                        required
                                        type="number"
                                        value={editingCar.price}
                                        onChange={e => setEditingCar({ ...editingCar, price: Number(e.target.value) })}
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            {/* ── SECTION: Tipo Annuncio ── */}
                            <div className="ce-section">
                                <div className="ce-section-title"><span>Tipo Annuncio</span></div>
                                <div className="ce-segmented-control">
                                    <button
                                        type="button"
                                        className={`ce-segment ${editingCar.listing_type === 'sale' ? 'active' : ''}`}
                                        onClick={() => setEditingCar({ ...editingCar, listing_type: 'sale' })}
                                    >Vendita</button>
                                    <button
                                        type="button"
                                        className={`ce-segment ${editingCar.listing_type === 'rental' ? 'active' : ''}`}
                                        onClick={() => setEditingCar({ ...editingCar, listing_type: 'rental' })}
                                    >Noleggio</button>
                                    <button
                                        type="button"
                                        className={`ce-segment ${editingCar.listing_type === 'both' ? 'active' : ''}`}
                                        onClick={() => setEditingCar({ ...editingCar, listing_type: 'both' })}
                                    >Entrambi</button>
                                </div>
                            </div>

                            {/* ── SECTION: Disponibilità ── */}
                            <div className="ce-section ce-toggle-section">
                                <div className="ce-toggle-row">
                                    <div>
                                        <span className="ce-toggle-label">Disponibile</span>
                                        <span className="ce-toggle-desc">Il veicolo è attualmente disponibile per la vendita o il noleggio.</span>
                                    </div>
                                    <label className="ce-toggle">
                                        <input type="checkbox" checked={editingCar.available} onChange={e => setEditingCar({ ...editingCar, available: e.target.checked })} />
                                        <span className="ce-toggle-slider" />
                                    </label>
                                </div>
                            </div>

                            {/* ── Submit ── */}
                            <button type="submit" className="ce-submit-btn" disabled={loadingCars}>
                                {loadingCars ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                                {editingCar.id ? 'Salva Modifiche' : 'Pubblica Annuncio'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
