import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User, Mail, Phone, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';

interface OrderFormProps {
    carId: number;
    carName: string;
    carBrand: string;
    listingType: 'sale' | 'rental' | 'both' | 'importazione';
    onClose?: () => void;
}

export const OrderForm = ({ carId, carName, carBrand, listingType, onClose }: OrderFormProps) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        orderType: listingType === 'rental' ? 'rental' : listingType === 'sale' ? 'purchase' : 'info',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!form.name || !form.email || !form.phone) {
            setError('Compila tutti i campi obbligatori');
            setLoading(false);
            return;
        }

        const { error: dbError } = await supabase.from('orders').insert({
            car_id: carId,
            car_name: carName,
            car_brand: carBrand,
            customer_name: form.name,
            customer_email: form.email,
            customer_phone: form.phone,
            order_type: form.orderType,
            message: form.message || null,
            status: 'pending'
        });

        setLoading(false);

        if (dbError) {
            setError('Errore nell\'invio. Riprova.');
            console.error(dbError);
            return;
        }

        setSuccess(true);
    };

    if (success) {
        return (
            <div className="order-success">
                <CheckCircle size={48} className="text-gold" />
                <h4>Richiesta Inviata!</h4>
                <p>Ti contatteremo al più presto per <strong>{carBrand} {carName}</strong>.</p>
                {onClose && (
                    <button className="btn-primary" onClick={onClose} style={{ marginTop: '1rem' }}>
                        Chiudi
                    </button>
                )}
            </div>
        );
    }

    return (
        <form className="order-form" onSubmit={handleSubmit}>
            <h4 className="order-form-title">
                <Send size={18} />
                Richiedi Informazioni
            </h4>
            <p className="order-form-subtitle">
                Compila il modulo per <strong>{carBrand} {carName}</strong>
            </p>

            {/* Order Type */}
            <div className="order-type-selector">
                {(listingType === 'sale' || listingType === 'both') && (
                    <button
                        type="button"
                        className={`order-type-btn ${form.orderType === 'purchase' ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, orderType: 'purchase' })}
                    >
                        Acquisto
                    </button>
                )}
                {(listingType === 'rental' || listingType === 'both') && (
                    <button
                        type="button"
                        className={`order-type-btn ${form.orderType === 'rental' ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, orderType: 'rental' })}
                    >
                        Noleggio
                    </button>
                )}
                <button
                    type="button"
                    className={`order-type-btn ${form.orderType === 'info' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, orderType: 'info' })}
                >
                    Info
                </button>
            </div>

            {/* Form Fields */}
            <div className="order-field">
                <User size={16} className="order-field-icon" />
                <input
                    type="text"
                    placeholder="Nome e Cognome *"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                />
            </div>

            <div className="order-field">
                <Mail size={16} className="order-field-icon" />
                <input
                    type="email"
                    placeholder="Email *"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                />
            </div>

            <div className="order-field">
                <Phone size={16} className="order-field-icon" />
                <input
                    type="tel"
                    placeholder="Telefono *"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    required
                />
            </div>

            <div className="order-field order-field-textarea">
                <MessageSquare size={16} className="order-field-icon" />
                <textarea
                    placeholder="Messaggio (opzionale)"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={3}
                />
            </div>

            {error && <p className="order-error">{error}</p>}

            <button type="submit" className="btn-primary order-submit-btn" disabled={loading}>
                {loading ? (
                    <><Loader2 size={18} className="spin" /> Invio in corso...</>
                ) : (
                    <><Send size={18} /> Invia Richiesta</>
                )}
            </button>
        </form>
    );
};
