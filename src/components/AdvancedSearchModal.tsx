import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Check, Car, Gauge, Settings, Palette, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type SearchParams } from '../types/SearchParams';

interface AdvancedSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (params: SearchParams) => void;
    initialParams: SearchParams;
}

export const AdvancedSearchModal = ({ isOpen, onClose, onSearch, initialParams }: AdvancedSearchModalProps) => {
    const [params, setParams] = useState<SearchParams>(initialParams);

    // UI State for expanding sections
    const [expandedSection, setExpandedSection] = useState<string | null>('main');

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleCheckboxChange = (field: keyof SearchParams, value: any) => {
        setParams(prev => {
            const current = (prev[field] as any[]) || [];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const [availableOptions, setAvailableOptions] = useState({
        brands: ['Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Ferrari', 'Lamborghini'],
        bodyTypes: ['SUV', 'Sedan', 'Coupe', 'Cabriolet', 'Station Wagon', 'Hatchback', 'Van'],
        fuels: ['Benzina', 'Diesel', 'Elettrica', 'Ibrida', 'GPL', 'Metano'],
        transmissions: ['Manuale', 'Automatico', 'Semiautomatico']
    });

    useEffect(() => {
        const fetchOptions = async () => {
            const { data, error } = await supabase
                .from('cars')
                .select('brand, category, fuel, transmission');

            if (!error && data) {
                const brands = Array.from(new Set(data.map(item => item.brand))).filter(Boolean).sort();
                const bodyTypes = Array.from(new Set(data.map(item => item.category))).filter(Boolean).sort();
                const fuels = Array.from(new Set(data.map(item => item.fuel))).filter(Boolean).sort();
                const transmissions = Array.from(new Set(data.map(item => item.transmission))).filter(Boolean).sort();

                setAvailableOptions({
                    brands: brands.length > 0 ? brands : availableOptions.brands,
                    bodyTypes: bodyTypes.length > 0 ? bodyTypes : availableOptions.bodyTypes,
                    fuels: fuels.length > 0 ? fuels : availableOptions.fuels,
                    transmissions: transmissions.length > 0 ? transmissions : availableOptions.transmissions
                });
            }
        };

        fetchOptions();
    }, []);

    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
    // const bodyTypes was here
    // const fuels was here
    // const transmissions was here
    const doors = ['2/3', '4/5', '6/7'];
    const conditions = ['new', 'used', 'demo', 'km0', 'classic'];
    const featuresList = ['ABS', 'Airbag', 'Climatizzatore', 'Navigatore', 'Tettuccio apribile', 'Interni in pelle', 'Sensori di parcheggio', 'Telecamera', 'Cruise Control'];
    const colors = ['Nero', 'Bianco', 'Grigio', 'Argento', 'Blu', 'Rosso', 'Marrone', 'Verde', 'Giallo', 'Beige', 'Oro', 'Viola', 'Arancione', 'Bronzo'];
    const interiorColors = ['Nero', 'Grigio', 'Beige', 'Marrone', 'Rosso', 'Bianco', 'Blu'];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="relative w-full max-w-4xl max-h-[90vh] bg-[#121212] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#1a1a1a]">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Settings className="text-[#d4af37]" />
                                Ricerca Avanzata
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="text-white" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                            {/* Dati Principali */}
                            <div className="space-y-4">
                                <div
                                    className="flex items-center justify-between cursor-pointer group"
                                    onClick={() => toggleSection('main')}
                                >
                                    <h3 className="text-lg font-semibold text-[#d4af37] flex items-center gap-2">
                                        <Car size={20} /> Dati principali & Località
                                    </h3>
                                    <ChevronDown className={`transform transition-transform ${expandedSection === 'main' ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {expandedSection === 'main' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            <label className="space-y-2">
                                                <span className="text-sm text-gray-400">Carrozzeria</span>
                                                <select
                                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none modal-select"
                                                    value={params.bodyType || ''}
                                                    onChange={(e) => setParams({ ...params, bodyType: e.target.value })}
                                                >
                                                    <option value="">Tutto</option>
                                                    {availableOptions.bodyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                </select>
                                            </label>

                                            <label className="space-y-2">
                                                <span className="text-sm text-gray-400">Marca</span>
                                                <select
                                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none modal-select"
                                                    value={params.brand}
                                                    onChange={(e) => setParams({ ...params, brand: e.target.value })}
                                                >
                                                    <option value="">Tutto</option>
                                                    {availableOptions.brands.map(brand => (
                                                        <option key={brand} value={brand}>{brand}</option>
                                                    ))}
                                                </select>
                                            </label>

                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="space-y-2">
                                                    <span className="text-sm text-gray-400">Prezzo Da</span>
                                                    <select
                                                        className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none modal-select"
                                                        value={params.minPrice || ''}
                                                        onChange={(e) => setParams({ ...params, minPrice: Number(e.target.value) })}
                                                    >
                                                        <option value="">Da</option>
                                                        <option value="5000">€ 5.000</option>
                                                        <option value="10000">€ 10.000</option>
                                                        <option value="20000">€ 20.000</option>
                                                        <option value="50000">€ 50.000</option>
                                                    </select>
                                                </label>
                                                <label className="space-y-2">
                                                    <span className="text-sm text-gray-400">A</span>
                                                    <select
                                                        className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none modal-select"
                                                        value={params.maxPrice || ''}
                                                        onChange={(e) => setParams({ ...params, maxPrice: Number(e.target.value) })}
                                                    >
                                                        <option value="">A</option>
                                                        <option value="20000">€ 20.000</option>
                                                        <option value="50000">€ 50.000</option>
                                                        <option value="100000">€ 100.000</option>
                                                        <option value="200000">€ 200.000+</option>
                                                    </select>
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="space-y-2">
                                                    <span className="text-sm text-gray-400">Anno Da</span>
                                                    <select
                                                        className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none modal-select"
                                                        value={params.year || ''}
                                                        onChange={(e) => setParams({ ...params, year: Number(e.target.value) })}
                                                    >
                                                        <option value="">Da</option>
                                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </label>
                                                <label className="space-y-2">
                                                    <span className="text-sm text-gray-400">A</span>
                                                    <select
                                                        className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none modal-select"
                                                    >
                                                        <option value="">A</option>
                                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </label>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="h-px bg-white/10" />

                            {/* Specifiche Tecniche */}
                            <div className="space-y-4">
                                <div
                                    className="flex items-center justify-between cursor-pointer group"
                                    onClick={() => toggleSection('specs')}
                                >
                                    <h3 className="text-lg font-semibold text-[#d4af37] flex items-center gap-2">
                                        <Gauge size={20} /> Specifiche Tecniche
                                    </h3>
                                    <ChevronDown className={`transform transition-transform ${expandedSection === 'specs' ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {expandedSection === 'specs' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-400">Carburante</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableOptions.fuels.map(fuel => (
                                                        <button
                                                            key={fuel}
                                                            onClick={() => handleCheckboxChange('fuelType', fuel)}
                                                            className={`px-3 py-1.5 text-sm rounded-lg border ${params.fuelType?.includes(fuel)
                                                                ? 'bg-[#d4af37] text-black border-[#d4af37]'
                                                                : 'bg-transparent border-white/20 text-gray-300 hover:border-white/40'
                                                                } transition-all`}
                                                        >
                                                            {fuel}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-400">Cambio</span>
                                                <select
                                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none modal-select"
                                                    value={params.transmission || ''}
                                                    onChange={(e) => setParams({ ...params, transmission: e.target.value })}
                                                >
                                                    <option value="">Tutto</option>
                                                    {availableOptions.transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-400">Potenza (kW)</span>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input
                                                        type="number"
                                                        placeholder="Da kW"
                                                        className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none"
                                                        value={params.powerMin || ''}
                                                        onChange={(e) => setParams({ ...params, powerMin: Number(e.target.value) })}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="A kW"
                                                        className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none"
                                                        value={params.powerMax || ''}
                                                        onChange={(e) => setParams({ ...params, powerMax: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-400">N. Porte</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        className={`flex-1 p-2 rounded-xl border ${!params.doors ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-white/10 text-gray-400'}`}
                                                        onClick={() => setParams({ ...params, doors: '' })}
                                                    >
                                                        Tutto
                                                    </button>
                                                    {doors.map(d => (
                                                        <button
                                                            key={d}
                                                            className={`flex-1 p-2 rounded-xl border ${params.doors === d ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-white/10 text-gray-400'}`}
                                                            onClick={() => setParams({ ...params, doors: d })}
                                                        >
                                                            {d}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="h-px bg-white/10" />

                            {/* Colors & Features */}
                            <div className="space-y-4">
                                <div
                                    className="flex items-center justify-between cursor-pointer group"
                                    onClick={() => toggleSection('features')}
                                >
                                    <h3 className="text-lg font-semibold text-[#d4af37] flex items-center gap-2">
                                        <Palette size={20} /> Colori & Dotazioni
                                    </h3>
                                    <ChevronDown className={`transform transition-transform ${expandedSection === 'features' ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {expandedSection === 'features' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-400">Colore Esterno</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {colors.map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => handleCheckboxChange('color', color)}
                                                            className={`w-8 h-8 rounded-full border-2 ${params.color?.includes(color) ? 'border-[#d4af37] scale-110' : 'border-transparent'
                                                                } flex items-center justify-center transition-all`}
                                                            style={{ backgroundColor: color === 'Nero' ? 'black' : color === 'Bianco' ? 'white' : color === 'Rosso' ? '#ef4444' : color.toLowerCase() }}
                                                            title={color}
                                                        >
                                                            {params.color?.includes(color) && <Check size={14} className={color === 'Bianco' ? 'text-black' : 'text-white'} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-400">Colore Interni</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {interiorColors.map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => handleCheckboxChange('interiorColor', color)}
                                                            className={`w-8 h-8 rounded-full border-2 ${params.interiorColor?.includes(color) ? 'border-[#d4af37] scale-110' : 'border-transparent'
                                                                } flex items-center justify-center transition-all`}
                                                            style={{ backgroundColor: color === 'Nero' ? 'black' : color === 'Bianco' ? 'white' : color === 'Rosso' ? '#ef4444' : color.toLowerCase() }}
                                                            title={color}
                                                        >
                                                            {params.interiorColor?.includes(color) && <Check size={14} className={color === 'Bianco' ? 'text-black' : 'text-white'} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-400">Dotazioni</span>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {featuresList.map(feature => (
                                                        <label key={feature} className="flex items-center gap-2 cursor-pointer group">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${params.features?.includes(feature)
                                                                ? 'bg-[#d4af37] border-[#d4af37]'
                                                                : 'border-white/20 group-hover:border-white/40'
                                                                }`}>
                                                                {params.features?.includes(feature) && <Check size={12} className="text-black" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={params.features?.includes(feature)}
                                                                onChange={() => handleCheckboxChange('features', feature)}
                                                            />
                                                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{feature}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="h-px bg-white/10" />

                            {/* Conditions & Sellers */}
                            <div className="space-y-4">
                                <div
                                    className="flex items-center justify-between cursor-pointer group"
                                    onClick={() => toggleSection('conditions')}
                                >
                                    <h3 className="text-lg font-semibold text-[#d4af37] flex items-center gap-2">
                                        <FileText size={20} /> Condizioni
                                    </h3>
                                    <ChevronDown className={`transform transition-transform ${expandedSection === 'conditions' ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {expandedSection === 'conditions' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-400">Condizione Veicolo</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {conditions.map(cond => (
                                                        <button
                                                            key={cond}
                                                            onClick={() => handleCheckboxChange('condition', cond)}
                                                            className={`px-3 py-1.5 text-sm rounded-lg border capitalize ${params.condition?.includes(cond as any)
                                                                ? 'bg-[#d4af37] text-black border-[#d4af37]'
                                                                : 'bg-transparent border-white/20 text-gray-300 hover:border-white/40'
                                                                } transition-all`}
                                                        >
                                                            {cond === 'new' ? 'Nuovo' : cond === 'used' ? 'Usato' : cond === 'km0' ? 'KM0' : cond === 'demo' ? 'Dimostrativo' : 'Epoca'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-[#222] bg-[#1a1a1a] flex justify-between items-center">
                            <button
                                onClick={() => setParams(initialParams)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Reset Filtri
                            </button>
                            <button
                                onClick={() => onSearch(params)}
                                className="bg-[#d4af37] text-black px-8 py-3 rounded-full font-bold hover:bg-[#c5a028] transition-all transform hover:scale-105 shadow-lg shadow-[#d4af37]/20"
                            >
                                Mostra Risultati
                            </button>
                        </div>
                    </motion.div >
                </div >
            )}
        </AnimatePresence >
    );
};
