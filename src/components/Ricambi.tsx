import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, X, Send, User, Mail, Phone, MessageSquare, Package, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

interface CustomField {
    label: string;
    value: string;
}

interface RicambioProduct {
    id: number;
    name: string;
    description: string | null;
    category: string;
    brand: string | null;
    price: number;
    image: string | null;
    available: boolean;
    custom_fields: CustomField[] | null;
}

interface CartItem {
    product: RicambioProduct;
    quantity: number;
}

export const Ricambi = () => {
    const { language } = useLanguage();
    const [products, setProducts] = useState<RicambioProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tutti');
    const [selectedBrand, setSelectedBrand] = useState('Tutti');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderSending, setOrderSending] = useState(false);
    const [orderSent, setOrderSent] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [orderForm, setOrderForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('ricambi')
            .select('*')
            .eq('available', true)
            .order('created_at', { ascending: false });
        setProducts(data || []);
        setLoading(false);
    };

    const categories = ['Tutti', ...Array.from(new Set(products.map(p => p.category)))];
    const brands = ['Tutti', ...Array.from(new Set(products.filter(p => p.brand).map(p => p.brand!)))];

    const filtered = products.filter(p => {
        if (selectedCategory !== 'Tutti' && p.category !== selectedCategory) return false;
        if (selectedBrand !== 'Tutti' && p.brand !== selectedBrand) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return p.name.toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q) ||
                (p.brand || '').toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q);
        }
        return true;
    });

    const addToCart = (product: RicambioProduct) => {
        setCart(prev => {
            const existing = prev.find(c => c.product.id === product.id);
            if (existing) {
                return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(c => c.product.id !== productId));
    };

    const updateQuantity = (productId: number, qty: number) => {
        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(c => c.product.id === productId ? { ...c, quantity: qty } : c));
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    const formatPrice = (price: number) => new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(price);

    const handleSubmitOrder = async () => {
        if (!orderForm.name || !orderForm.email) return;
        setOrderSending(true);
        try {
            const { error } = await supabase.from('ricambi_orders').insert({
                customer_name: orderForm.name,
                customer_email: orderForm.email,
                customer_phone: orderForm.phone,
                items: cart.map(c => ({ id: c.product.id, name: c.product.name, price: c.product.price, quantity: c.quantity })),
                total: cartTotal,
                message: orderForm.message,
                status: 'pending'
            });
            if (error) throw error;
            setOrderSent(true);
            setCart([]);
            setOrderForm({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => {
                setOrderSent(false);
                setShowOrderForm(false);
                setShowCart(false);
            }, 3000);
        } catch (err: any) {
            alert('Errore: ' + err.message);
        } finally {
            setOrderSending(false);
        }
    };

    return (
        <section className="ricambi-section section-padding" id="ricambi">
            <div className="container">
                <motion.div
                    className="section-title-area"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="section-label">
                        <Package size={16} />
                        {language === 'it' ? 'CATALOGO RICAMBI' : 'SPARE PARTS CATALOG'}
                    </span>
                    <h2>{language === 'it' ? 'Ricambi Auto' : 'Car Spare Parts'}</h2>
                    <p className="section-subtitle">
                        {language === 'it'
                            ? 'Ricambi originali e compatibili per tutte le marche. Ordina direttamente online.'
                            : 'Original and compatible spare parts for all makes. Order directly online.'}
                    </p>
                </motion.div>

                <div className="ricambi-toolbar">
                    <div className="ricambi-search">
                        <Search size={18} />
                        <input
                            placeholder={language === 'it' ? 'Cerca ricambi...' : 'Search parts...'}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button className="ricambi-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} />
                        {language === 'it' ? 'Filtri' : 'Filters'}
                        <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                    </button>

                    <button className="ricambi-cart-btn" onClick={() => setShowCart(true)}>
                        <ShoppingCart size={18} />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            className="ricambi-filters"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="filter-group">
                                <label>{language === 'it' ? 'Categoria' : 'Category'}</label>
                                <div className="filter-chips">
                                    {categories.map(c => (
                                        <button key={c} className={`chip ${selectedCategory === c ? 'active' : ''}`} onClick={() => setSelectedCategory(c)}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {brands.length > 1 && (
                                <div className="filter-group">
                                    <label>{language === 'it' ? 'Marca' : 'Brand'}</label>
                                    <div className="filter-chips">
                                        {brands.map(b => (
                                            <button key={b} className={`chip ${selectedBrand === b ? 'active' : ''}`} onClick={() => setSelectedBrand(b!)}>
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="ricambi-count">
                    <span className="text-gold">{filtered.length}</span> {language === 'it' ? 'ricambi disponibili' : 'parts available'}
                </div>

                {loading ? (
                    <div className="ricambi-loading">
                        <div className="spinner" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="ricambi-empty">
                        <Package size={48} />
                        <h3>{language === 'it' ? 'Nessun ricambio trovato' : 'No parts found'}</h3>
                        <p>{language === 'it' ? 'Prova a modificare i filtri di ricerca' : 'Try adjusting your search filters'}</p>
                    </div>
                ) : (
                    <div className="ricambi-grid">
                        <AnimatePresence>
                            {filtered.map(product => (
                                <motion.div
                                    key={product.id}
                                    className="ricambi-card"
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    {product.image && (
                                        <div className="ricambi-card-img">
                                            <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="img-fade-in" onLoad={e => (e.target as HTMLImageElement).classList.add('loaded')} />
                                        </div>
                                    )}
                                    <div className="ricambi-card-body">
                                        <span className="ricambi-category">{product.category}</span>
                                        {product.brand && <span className="ricambi-brand">{product.brand}</span>}
                                        <h4>{product.name}</h4>
                                        {product.description && <p className="ricambi-desc">{product.description}</p>}
                                        {product.custom_fields && product.custom_fields.length > 0 && (
                                            <div className="ricambi-custom-fields">
                                                {product.custom_fields.filter(f => f.label && f.value).map((field, idx) => (
                                                    <div key={idx} className="ricambi-field">
                                                        <span className="ricambi-field-label">{field.label}</span>
                                                        <span className="ricambi-field-value">{field.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="ricambi-card-footer">
                                            <span className="ricambi-price">€ {formatPrice(product.price)}</span>
                                            <button className="ricambi-add-btn" onClick={() => addToCart(product)}>
                                                <ShoppingCart size={14} />
                                                {language === 'it' ? 'Aggiungi' : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Cart Sidebar */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div className="cart-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)} />
                        <motion.div className="cart-sidebar" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}>
                            <div className="cart-header">
                                <h3><ShoppingCart size={20} /> {language === 'it' ? 'Carrello' : 'Cart'} ({cartCount})</h3>
                                <button onClick={() => setShowCart(false)}><X size={20} /></button>
                            </div>

                            {orderSent ? (
                                <div className="cart-success">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <Send size={48} />
                                        <h3>{language === 'it' ? 'Ordine Inviato!' : 'Order Sent!'}</h3>
                                        <p>{language === 'it' ? 'Ti contatteremo al più presto.' : 'We will contact you soon.'}</p>
                                    </motion.div>
                                </div>
                            ) : showOrderForm ? (
                                <div className="cart-order-form">
                                    <h4>{language === 'it' ? 'I Tuoi Dati' : 'Your Details'}</h4>
                                    <div className="order-field">
                                        <User size={16} />
                                        <input placeholder={language === 'it' ? 'Nome e Cognome *' : 'Full Name *'} value={orderForm.name} onChange={e => setOrderForm({ ...orderForm, name: e.target.value })} required />
                                    </div>
                                    <div className="order-field">
                                        <Mail size={16} />
                                        <input type="email" placeholder="Email *" value={orderForm.email} onChange={e => setOrderForm({ ...orderForm, email: e.target.value })} required />
                                    </div>
                                    <div className="order-field">
                                        <Phone size={16} />
                                        <input placeholder={language === 'it' ? 'Telefono' : 'Phone'} value={orderForm.phone} onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })} />
                                    </div>
                                    <div className="order-field">
                                        <MessageSquare size={16} />
                                        <textarea placeholder={language === 'it' ? 'Note aggiuntive...' : 'Additional notes...'} value={orderForm.message} onChange={e => setOrderForm({ ...orderForm, message: e.target.value })} rows={3} />
                                    </div>
                                    <div className="cart-order-total">
                                        <span>{language === 'it' ? 'Totale:' : 'Total:'}</span>
                                        <span className="text-gold">€ {formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="cart-form-actions">
                                        <button className="cart-back-btn" onClick={() => setShowOrderForm(false)}>
                                            {language === 'it' ? 'Indietro' : 'Back'}
                                        </button>
                                        <button className="cart-submit-btn" onClick={handleSubmitOrder} disabled={orderSending || !orderForm.name || !orderForm.email}>
                                            {orderSending ? <div className="spinner-sm" /> : <Send size={16} />}
                                            {language === 'it' ? 'Invia Ordine' : 'Send Order'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="cart-items">
                                        {cart.length === 0 ? (
                                            <div className="cart-empty">
                                                <ShoppingCart size={32} />
                                                <p>{language === 'it' ? 'Il carrello è vuoto' : 'Your cart is empty'}</p>
                                            </div>
                                        ) : cart.map(item => (
                                            <div key={item.product.id} className="cart-item">
                                                {item.product.image && <img src={item.product.image} alt={item.product.name} />}
                                                <div className="cart-item-info">
                                                    <h5>{item.product.name}</h5>
                                                    <span>€ {formatPrice(item.product.price)}</span>
                                                </div>
                                                <div className="cart-item-qty">
                                                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                                                </div>
                                                <button className="cart-item-remove" onClick={() => removeFromCart(item.product.id)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {cart.length > 0 && (
                                        <div className="cart-footer">
                                            <div className="cart-total">
                                                <span>{language === 'it' ? 'Totale:' : 'Total:'}</span>
                                                <span className="text-gold">€ {formatPrice(cartTotal)}</span>
                                            </div>
                                            <button className="cart-checkout-btn" onClick={() => setShowOrderForm(true)}>
                                                <Send size={16} />
                                                {language === 'it' ? 'Procedi all\'ordine' : 'Proceed to Order'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
};
