import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsConditions = () => {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-white text-black py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-gold hover:underline mb-10 transition-all">
                    <ArrowLeft size={20} />
                    {language === 'it' ? 'Torna alla Home' : 'Back to Home'}
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <FileText className="text-gold" size={40} />
                        <h1 className="text-4xl font-bold uppercase tracking-wider">
                            {language === 'it' ? 'Termini e Condizioni' : 'Terms & Conditions'}
                        </h1>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
                        {language === 'it' ? (
                            <>
                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">1. Servizi Offerti</h2>
                                    <p>
                                        Tonaydin Luxury Cars offre servizi di vendita, noleggio a breve e lungo termine, perizia, ricambi e importazione di veicoli di lusso.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">2. Prenotazioni e Noleggio</h2>
                                    <p>
                                        Le prenotazioni sono soggette a disponibilità e conferma da parte del nostro team. Per il noleggio è richiesto il possesso di una patente di guida valida e il soddisfacimento dei requisiti di età minima.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">3. Pagamenti e Depositi</h2>
                                    <p>
                                        Tutti i pagamenti devono essere effettuati secondo le modalità concordate al momento della prenotazione. Per il noleggio può essere richiesto un deposito cauzionale.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">4. Responsabilità</h2>
                                    <p>
                                        L'utente è responsabile dell'uso corretto del veicolo durante il periodo di noleggio e del rispetto di tutte le leggi stradali vigenti.
                                    </p>
                                </section>
                            </>
                        ) : (
                            <>
                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">1. Offered Services</h2>
                                    <p>
                                        Tonaydin Luxury Cars offers sales, short and long-term rental, valuation, spare parts, and luxury vehicle import services.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">2. Bookings and Rental</h2>
                                    <p>
                                        Bookings are subject to availability and confirmation by our team. Rental requires a valid driver's license and meeting minimum age requirements.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">3. Payments and Deposits</h2>
                                    <p>
                                        All payments must be made according to the methods agreed upon at the time of booking. A security deposit may be required for rentals.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">4. Liability</h2>
                                    <p>
                                        The user is responsible for the correct use of the vehicle during the rental period and for compliance with all applicable traffic laws.
                                    </p>
                                </section>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
