import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
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
                        <Shield className="text-gold" size={40} />
                        <h1 className="text-4xl font-bold uppercase tracking-wider">
                            {language === 'it' ? 'Privacy Policy' : 'Privacy Policy'}
                        </h1>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
                        {language === 'it' ? (
                            <>
                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">1. Informazioni Generali</h2>
                                    <p>
                                        Tonaydin Luxury Cars si impegna a proteggere la privacy dei propri utenti. Questa informativa descrive come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">2. Dati Raccolti</h2>
                                    <p>
                                        Raccogliamo informazioni fornite volontariamente tramite i nostri moduli di contatto, come nome, email e numero di telefono, necessarie per fornirti i nostri servizi di vendita e noleggio.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">3. Utilizzo dei Dati</h2>
                                    <p>
                                        I tuoi dati vengono utilizzati esclusivamente per gestire le tue richieste, processare ordini e inviarti informazioni rilevanti sui nostri servizi. Non vendiamo i tuoi dati a terze parti.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">4. I Tuoi Diritti</h2>
                                    <p>
                                        Hai il diritto di richiedere l'accesso, la rettifica o la cancellazione dei tuoi dati personali in qualsiasi momento contattandoci via email.
                                    </p>
                                </section>
                            </>
                        ) : (
                            <>
                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">1. General Information</h2>
                                    <p>
                                        Tonaydin Luxury Cars is committed to protecting the privacy of its users. This policy describes how we collect, use, and protect your personal data.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">2. Collected Data</h2>
                                    <p>
                                        We collect information provided voluntarily through our contact forms, such as name, email, and phone number, necessary to provide our sales and rental services.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">3. Use of Data</h2>
                                    <p>
                                        Your data is used exclusively to manage your requests, process orders, and send you relevant information about our services. We do not sell your data to third parties.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-black mb-4">4. Your Rights</h2>
                                    <p>
                                        You have the right to request access, rectification, or deletion of your personal data at any time by contacting us via email.
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
