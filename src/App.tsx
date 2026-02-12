import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Fleet } from './components/Fleet';
import { Services } from './components/Services';
import { Footer } from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { emptySearchParams, type SearchParams } from './types/SearchParams';

function App() {
  const [searchParams, setSearchParams] = useState<SearchParams>(emptySearchParams);

  return (
    <LanguageProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Hero onSearch={(params) => setSearchParams(params)} />
          <Fleet searchParams={searchParams} onClearSearch={() => setSearchParams(emptySearchParams)} />
          <Services />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
