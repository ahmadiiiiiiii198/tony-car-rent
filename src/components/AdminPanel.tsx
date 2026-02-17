
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
    ShieldCheck, LogOut, Clock, CheckCircle, Package,
    Mail, Phone, Car as CarIcon, Calendar, Search, RefreshCw,
    ChevronDown, ChevronUp, MessageSquare, Trash2, ArrowLeft,
    Plus, Edit, Save, X, Upload, LayoutGrid, Settings,
    Fuel, Users, Gauge
} from 'lucide-react';

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

const ADMIN_PASSWORD = 'tonaydin2026';

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
    const [activeTab, setActiveTab] = useState<'orders' | 'fleet' | 'settings'>('orders');

    // Orders State
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, confirmed: 0, rejected: 0, completed: 0 });

    // Fleet State
    const [cars, setCars] = useState<Car[]>([]);
    const [loadingCars, setLoadingCars] = useState(false);
    const [editingCar, setEditingCar] = useState<Car | null>(null);
    const [showCarModal, setShowCarModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const multiFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = sessionStorage.getItem('admin_auth');
        if (saved === 'true') setAuthenticated(true);
    }, []);

    useEffect(() => {
        if (authenticated) {
            fetchOrders();
            fetchCars();
            const interval = setInterval(fetchOrders, 30000);
            return () => clearInterval(interval);
        }
    }, [authenticated]);

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
        const carData = { ...editingCar };

        // Remove ID if adding new car
        const isNew = !carData.id;

        let error;
        if (isNew) {
            const { error: insertError } = await supabase.from('cars').insert([carData]);
            error = insertError;
        } else {
            const { error: updateError } = await supabase.from('cars').update(carData).eq('id', carData.id);
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

    const uploadImage = async (file: File, isMain: boolean = true) => {
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
                            <MessageSquare size={18} /> Richieste
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'fleet' ? 'active' : ''}`}
                            onClick={() => setActiveTab('fleet')}
                        >
                            <LayoutGrid size={18} /> Flotta
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={18} /> Impostazioni
                        </button>
                    </nav>

                    <div className="admin-header-right">
                        <a href="/" className="admin-site-link">
                            <ArrowLeft size={16} /> Sito
                        </a>
                        <button onClick={handleLogout} className="admin-logout-btn">
                            <LogOut size={16} /> Esci
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
            </div>

            {/* Car Editor Modal */}
            {showCarModal && editingCar && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h3>{editingCar.id ? 'Modifica Veicolo' : 'Nuovo Veicolo'}</h3>
                            <button onClick={() => { setShowCarModal(false); setEditingCar(null); }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveCar} className="modal-form">
                            <div className="form-grid">
                                <div className="form-section">
                                    <h4>Informazioni Base</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Marca</label>
                                            <input required value={editingCar.brand} onChange={e => setEditingCar({ ...editingCar, brand: e.target.value })} placeholder="Es: Ferrari" />
                                        </div>
                                        <div className="form-group">
                                            <label>Modello</label>
                                            <input required value={editingCar.name} onChange={e => setEditingCar({ ...editingCar, name: e.target.value })} placeholder="Es: 488 Pista" />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Prezzo (€)</label>
                                            <input required type="number" value={editingCar.price} onChange={e => setEditingCar({ ...editingCar, price: Number(e.target.value) })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Tipo Listing</label>
                                            <select value={editingCar.listing_type} onChange={e => setEditingCar({ ...editingCar, listing_type: e.target.value as any })}>
                                                <option value="rental">Noleggio</option>
                                                <option value="sale">Vendita</option>
                                                <option value="both">Entrambi</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Categoria</label>
                                        <select value={editingCar.category} onChange={e => setEditingCar({ ...editingCar, category: e.target.value })}>
                                            <option value="Sports">Sportive</option>
                                            <option value="Supercar">Supercar</option>
                                            <option value="Hypercar">Hypercar</option>
                                            <option value="SUV">SUV</option>
                                            <option value="LUXURY">Luxury</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Descrizione</label>
                                        <textarea value={editingCar.description || ''} onChange={e => setEditingCar({ ...editingCar, description: e.target.value })} rows={4} placeholder="Descrizione del veicolo..." />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Specifiche Tecniche</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label><Users size={14} /> Posti</label>
                                            <input type="number" value={editingCar.seats} onChange={e => setEditingCar({ ...editingCar, seats: Number(e.target.value) })} />
                                        </div>
                                        <div className="form-group">
                                            <label><Fuel size={14} /> Carburante</label>
                                            <input value={editingCar.fuel} onChange={e => setEditingCar({ ...editingCar, fuel: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label><Gauge size={14} /> Potenza (CV)</label>
                                            <input value={editingCar.power} onChange={e => setEditingCar({ ...editingCar, power: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Anno</label>
                                            <input type="number" value={editingCar.year || 0} onChange={e => setEditingCar({ ...editingCar, year: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Chilometri</label>
                                            <input value={editingCar.km || ''} onChange={e => setEditingCar({ ...editingCar, km: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Disponibile</label>
                                            <div className="toggle-switch">
                                                <input type="checkbox" checked={editingCar.available} onChange={e => setEditingCar({ ...editingCar, available: e.target.checked })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section images-section">
                                    <h4>Galleria Immagini</h4>
                                    <div className="main-image-upload">
                                        <div className="preview-container" onClick={handleUploadClick}>
                                            <img src={editingCar.image || '/hero.png'} alt="Preview" />
                                            <div className="upload-overlay">
                                                <Upload size={24} />
                                                <span>{uploadingImage ? 'Caricamento...' : 'Cambia Immagine Principal'}</span>
                                            </div>
                                        </div>
                                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], true)} />
                                    </div>

                                    <div className="multi-images-grid">
                                        {editingCar.images?.map((img, idx) => (
                                            <div key={idx} className="thumb-preview">
                                                <img src={img} alt="" />
                                                <button type="button" onClick={() => setEditingCar({ ...editingCar, images: editingCar.images.filter((_, i) => i !== idx) })} className="remove-img"><X size={12} /></button>
                                            </div>
                                        ))}
                                        <button type="button" className="add-thumb-btn" onClick={handleMultiUploadClick}>
                                            <Plus size={20} />
                                        </button>
                                        <input type="file" ref={multiFileInputRef} hidden multiple accept="image/*" onChange={e => {
                                            if (e.target.files) {
                                                Array.from(e.target.files).forEach(f => uploadImage(f, false));
                                            }
                                        }} />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowCarModal(false)}>Annulla</button>
                                <button type="submit" className="btn-save" disabled={loadingCars}>
                                    {loadingCars ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                                    Salva Veicolo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
