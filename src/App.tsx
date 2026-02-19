import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Fleet } from './components/Fleet';
import { Services } from './components/Services';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { TestCarShowcase } from './components/TestCarShowcase';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { emptySearchParams, type SearchParams } from './types/SearchParams';

function MainSite() {
  const [searchParams, setSearchParams] = useState<SearchParams>(emptySearchParams);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
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
        </Routes>
      </SettingsProvider>
    </LanguageProvider>
  );
}

export default App;
