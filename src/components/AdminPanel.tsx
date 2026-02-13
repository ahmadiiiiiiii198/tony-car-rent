import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    ShieldCheck, LogOut, Clock, CheckCircle, XCircle, Package,
    Mail, Phone, User, Car, Calendar, Search, RefreshCw,
    ChevronDown, ChevronUp, MessageSquare, Trash2, ArrowLeft
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
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, rejected: 0, completed: 0 });

    useEffect(() => {
        const saved = sessionStorage.getItem('admin_auth');
        if (saved === 'true') setAuthenticated(true);
    }, []);

    useEffect(() => {
        if (authenticated) {
            fetchOrders();
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
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrders(data);
            setStats({
                total: data.length,
                pending: data.filter(o => o.status === 'pending').length,
                confirmed: data.filter(o => o.status === 'confirmed').length,
                rejected: data.filter(o => o.status === 'rejected').length,
                completed: data.filter(o => o.status === 'completed').length
            });
        }
        setLoading(false);
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', orderId);

        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'], updated_at: new Date().toISOString() } : o));
            setStats(prev => {
                const old = orders.find(o => o.id === orderId);
                if (!old) return prev;
                return {
                    ...prev,
                    [old.status]: prev[old.status as keyof typeof prev] - 1,
                    [newStatus]: (prev[newStatus as keyof typeof prev] as number) + 1
                };
            });
        }
    };

    const deleteOrder = async (orderId: string) => {
        if (!confirm('Sei sicuro di voler eliminare questo ordine?')) return;
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (!error) {
            setOrders(prev => prev.filter(o => o.id !== orderId));
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
                        <h1>Admin Panel</h1>
                    </div>
                    <div className="admin-header-right">
                        <a href="/" className="admin-site-link">
                            <ArrowLeft size={16} /> Sito
                        </a>
                        <button onClick={fetchOrders} className="admin-refresh-btn" disabled={loading}>
                            <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        </button>
                        <button onClick={handleLogout} className="admin-logout-btn">
                            <LogOut size={16} /> Esci
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-container">
                {/* Stats Cards */}
                <div className="admin-stats">
                    <div className="stat-card" onClick={() => setFilterStatus('all')}>
                        <Package size={24} />
                        <div>
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Totale</span>
                        </div>
                    </div>
                    <div className="stat-card stat-pending" onClick={() => setFilterStatus('pending')}>
                        <Clock size={24} />
                        <div>
                            <span className="stat-number">{stats.pending}</span>
                            <span className="stat-label">In Attesa</span>
                        </div>
                    </div>
                    <div className="stat-card stat-confirmed" onClick={() => setFilterStatus('confirmed')}>
                        <CheckCircle size={24} />
                        <div>
                            <span className="stat-number">{stats.confirmed}</span>
                            <span className="stat-label">Confermati</span>
                        </div>
                    </div>
                    <div className="stat-card stat-completed" onClick={() => setFilterStatus('completed')}>
                        <Package size={24} />
                        <div>
                            <span className="stat-number">{stats.completed}</span>
                            <span className="stat-label">Completati</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="admin-filters">
                    <div className="admin-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Cerca per nome, email, telefono, auto..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="admin-filter-group">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="admin-select"
                        >
                            <option value="all">Tutti gli stati</option>
                            <option value="pending">In Attesa</option>
                            <option value="confirmed">Confermati</option>
                            <option value="rejected">Rifiutati</option>
                            <option value="completed">Completati</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="admin-select"
                        >
                            <option value="all">Tutti i tipi</option>
                            <option value="purchase">Acquisto</option>
                            <option value="rental">Noleggio</option>
                            <option value="info">Informazioni</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                <div className="admin-orders">
                    {loading && orders.length === 0 ? (
                        <div className="admin-loading">
                            <RefreshCw size={32} className="spin" />
                            <p>Caricamento ordini...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="admin-empty">
                            <Package size={48} />
                            <h3>Nessun ordine trovato</h3>
                            <p>Non ci sono ordini che corrispondono ai filtri selezionati.</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className={`admin-order-card ${order.status}`}>
                                <div
                                    className="order-card-header"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                    <div className="order-card-left">
                                        <span
                                            className="order-status-dot"
                                            style={{ background: statusColors[order.status] }}
                                        />
                                        <div className="order-card-info">
                                            <h4>{order.customer_name}</h4>
                                            <p className="order-car-info">
                                                <Car size={14} />
                                                {order.car_brand} {order.car_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="order-card-right">
                                        <span className="order-type-badge" data-type={order.order_type}>
                                            {orderTypeLabels[order.order_type]}
                                        </span>
                                        <span className="order-status-badge" style={{ color: statusColors[order.status], borderColor: statusColors[order.status] }}>
                                            {statusLabels[order.status]}
                                        </span>
                                        <span className="order-date">
                                            <Calendar size={12} /> {formatDate(order.created_at)}
                                        </span>
                                        {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {expandedOrder === order.id && (
                                    <div className="order-card-details">
                                        <div className="order-detail-grid">
                                            <div className="order-detail-item">
                                                <User size={16} />
                                                <div>
                                                    <span className="detail-label">Nome</span>
                                                    <span className="detail-value">{order.customer_name}</span>
                                                </div>
                                            </div>
                                            <div className="order-detail-item">
                                                <Mail size={16} />
                                                <div>
                                                    <span className="detail-label">Email</span>
                                                    <a href={`mailto:${order.customer_email}`} className="detail-value detail-link">
                                                        {order.customer_email}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="order-detail-item">
                                                <Phone size={16} />
                                                <div>
                                                    <span className="detail-label">Telefono</span>
                                                    <a href={`tel:${order.customer_phone}`} className="detail-value detail-link">
                                                        {order.customer_phone}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="order-detail-item">
                                                <Car size={16} />
                                                <div>
                                                    <span className="detail-label">Veicolo</span>
                                                    <span className="detail-value">{order.car_brand} {order.car_name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {order.message && (
                                            <div className="order-message">
                                                <MessageSquare size={16} />
                                                <p>{order.message}</p>
                                            </div>
                                        )}

                                        <div className="order-actions">
                                            <span className="order-actions-label">Cambia stato:</span>
                                            <div className="order-action-buttons">
                                                {order.status !== 'pending' && (
                                                    <button
                                                        className="action-status-btn pending"
                                                        onClick={() => updateStatus(order.id, 'pending')}
                                                    >
                                                        <Clock size={14} /> In Attesa
                                                    </button>
                                                )}
                                                {order.status !== 'confirmed' && (
                                                    <button
                                                        className="action-status-btn confirmed"
                                                        onClick={() => updateStatus(order.id, 'confirmed')}
                                                    >
                                                        <CheckCircle size={14} /> Conferma
                                                    </button>
                                                )}
                                                {order.status !== 'completed' && (
                                                    <button
                                                        className="action-status-btn completed"
                                                        onClick={() => updateStatus(order.id, 'completed')}
                                                    >
                                                        <Package size={14} /> Completa
                                                    </button>
                                                )}
                                                {order.status !== 'rejected' && (
                                                    <button
                                                        className="action-status-btn rejected"
                                                        onClick={() => updateStatus(order.id, 'rejected')}
                                                    >
                                                        <XCircle size={14} /> Rifiuta
                                                    </button>
                                                )}
                                                <button
                                                    className="action-status-btn delete"
                                                    onClick={() => deleteOrder(order.id)}
                                                >
                                                    <Trash2 size={14} /> Elimina
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
