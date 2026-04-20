import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Fleet } from './components/Fleet';
import { Services } from './components/Services';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { TestCarShowcase } from './components/TestCarShowcase';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { emptySearchParams, type SearchParams } from './types/SearchParams';

import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsConditions } from './components/TermsConditions';

function MainSite() {
  const [searchParams, setSearchParams] = useState<SearchParams>(emptySearchParams);
  const { language } = useLanguage();

  useEffect(() => {
    document.title = language === 'it' 
      ? 'Tonaydin Luxury Cars | Vendita e Noleggio Auto di Lusso a Torino'
      : 'Tonaydin Luxury Cars | Luxury Car Sales & Rental in Turin';
  }, [language]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      <Navbar />
      <main style={{ flex: 1, width: '100%', overflowX: 'hidden' }}>
        <Hero onSearch={(params) => setSearchParams(params)} />
        <Fleet searchParams={searchParams} onClearSearch={() => setSearchParams(emptySearchParams)} />
        <Services />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/test" element={<TestCarShowcase />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
        </Routes>
      </SettingsProvider>
    </LanguageProvider>
  );
}

export default App;
